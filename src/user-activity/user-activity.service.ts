import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from './entities/user-activity.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import * as useragent from 'useragent';
import { ActivityActionType } from 'common/enums/activity-action-type';

interface Agent {
  family: string;
  major: string;
  minor: string;
  patch: string;
  device: {
    family: string;
  };
}

export type ActivityLogOptions = {
  action: ActivityActionType;
  userId: number;
  details?: string;
  metadata?: Record<string, any>;
  request?: Request;
};

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async logActivity(options: ActivityLogOptions): Promise<UserActivity> {
    const { action, userId, details, metadata, request } = options;

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        admin: true,
      },
    });

    if (!user || !user.admin) {
      throw new Error('User not found');
    }

    const activity = this.userActivityRepository.create({
      action,
      user_name: user.username || 'Unknown',
      email: user.email || 'Unknown',
      details,
      metadata,
      admin_id: user.admin.id,
    });

    if (request) {
      this.extractRequestInfo(activity, request);
    }

    return await this.userActivityRepository.save(activity);
  }

  private extractRequestInfo(activity: UserActivity, request: Request): void {
    activity.ip_address = this.getIpFromRequest(request);

    const userAgentString = request.headers['user-agent'] || '';
    if (userAgentString) {
      try {
        const agent = useragent.parse(userAgentString) as unknown as Agent;

        if (agent && typeof agent === 'object') {
          if (agent.family && agent.major && agent.minor && agent.patch) {
            activity.browser = `${agent.family} ${agent.major}.${agent.minor}.${agent.patch}`;
          } else {
            activity.browser = 'Unknown Browser';
          }

          if (
            agent.device &&
            typeof agent.device === 'object' &&
            agent.device.family
          ) {
            activity.device =
              agent.device.family !== 'Other' ? agent.device.family : 'Desktop';
          } else {
            activity.device = 'Unknown Device';
          }
        }
      } catch (error) {
        activity.browser = 'Unknown Browser';
        activity.device = 'Unknown Device';
        console.error('Error parsing user agent:', error);
      }
    }
  }

  private getIpFromRequest(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip || request.socket.remoteAddress || 'Unknown';
  }

  async getRecentActivities(
    limit: number = 50,
    adminId?: number,
  ): Promise<UserActivity[]> {
    const query = this.userActivityRepository
      .createQueryBuilder('activity')
      .orderBy('activity.created_at', 'DESC')
      .take(limit);

    if (adminId) {
      query.where('activity.admin_id = :adminId', { adminId });
    }

    return await query.getMany();
  }
}
