import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminsService } from 'src/admins/admins.service';
import { SetMetadata } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
export const ADMIN_RIGHTS_KEY = 'admin_rights';

export const RequireAdminRights = (rights: string[]) =>
  SetMetadata(ADMIN_RIGHTS_KEY, rights);

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class AdminRightsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminsService: AdminsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRights = this.reflector.getAllAndOverride<string[]>(
      ADMIN_RIGHTS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRights || requiredRights.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('You are not authorized');
    }

    try {
      const admin = await this.adminsService.findByUserId(user.id);

      const hasAllRights = requiredRights.every((right) => {
        return admin[right] === true;
      });

      if (!hasAllRights) {
        throw new UnauthorizedException(
          'You do not have sufficient permissions to perform this action',
        );
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'You do not have sufficient permissions to perform this action',
      );
    }
  }
}
