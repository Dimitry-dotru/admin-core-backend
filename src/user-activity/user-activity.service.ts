import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as useragent from 'useragent';
import { ActivityActionType } from 'common/enums/activity-action-type';
import { User } from 'src/users/entities/user.entity';
import { UserActivity } from './entitites/user-activity.entity';

interface Agent {
  family: string;
  major: string;
  minor: string;
  patch: string;
  device: {
    family: string;
  };
  os: {
    family: string;
    major: string;
    minor: string;
  };
}

export interface ActivityLogOptions {
  action: ActivityActionType;
  userId: number;
  details?: string;
  metadata?: Record<string, any>;
  request?: Request;
}

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
      throw new Error(`User with ID ${userId} not found`);
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
          if (agent.family && agent.major) {
            activity.browser = `${agent.family} ${agent.major}${agent.minor ? '.' + agent.minor : ''}${agent.patch ? '.' + agent.patch : ''}`;
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

          if (agent.os && typeof agent.os === 'object' && agent.os.family) {
            if (!activity.metadata) {
              activity.metadata = {};
            }
            activity.metadata.os = `${agent.os.family} ${agent.os.major || ''}${agent.os.minor ? '.' + agent.os.minor : ''}`;
          }
        }
      } catch (error) {
        activity.browser = 'Unknown Browser';
        activity.device = 'Unknown Device';
        console.error('Error parsing user agent:', error);
      }
    }

    if (!activity.metadata) {
      activity.metadata = {};
    }

    if (request.path) {
      activity.metadata.path = request.path;
    }

    if (request.method) {
      activity.metadata.method = request.method;
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

    return request.ip || request.socket?.remoteAddress || 'Unknown';
  }

  async getRecentActivities(
    page = 1,
    take = 10,
    adminId?: number,
    userId?: number,
    actionType?: ActivityActionType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: UserActivity[]; meta: any }> {
    const skip = (page - 1) * take;

    const query = this.userActivityRepository
      .createQueryBuilder('activity')
      .orderBy('activity.created_at', 'DESC')
      .skip(skip)
      .take(take);

    if (adminId) {
      query.andWhere('activity.admin_id = :adminId', { adminId });
    }

    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (user) {
        query.andWhere('activity.email = :email', { email: user.email });
      }
    }

    if (actionType) {
      query.andWhere('activity.action = :actionType', { actionType });
    }

    if (startDate) {
      query.andWhere('activity.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('activity.created_at <= :endDate', { endDate });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        page,
        take,
        item_count: total,
        page_count: Math.ceil(total / take),
      },
    };
  }

  async getActivityStatistics(): Promise<Record<string, any>> {
    const actionCounts = await this.userActivityRepository
      .createQueryBuilder('activity')
      .select('activity.action, COUNT(*) as count')
      .groupBy('activity.action')
      .getRawMany();

    const mostActiveUsers = await this.userActivityRepository
      .createQueryBuilder('activity')
      .select('activity.email, activity.user_name, COUNT(*) as count')
      .groupBy('activity.email')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityByDay = await this.userActivityRepository
      .createQueryBuilder('activity')
      .select('DATE(activity.created_at) as date, COUNT(*) as count')
      .where('activity.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      actionCounts,
      mostActiveUsers,
      activityByDay,
      totalActivities: await this.userActivityRepository.count(),
    };
  }

  async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.userActivityRepository
      .createQueryBuilder()
      .delete()
      .from(UserActivity)
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
