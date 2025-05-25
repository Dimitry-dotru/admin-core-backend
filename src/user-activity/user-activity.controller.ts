import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Delete,
  Post,
  Body,
} from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  AdminRightsGuard,
  RequireAdminRights,
} from 'src/auth/guards/admin-rights.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ActivityActionType } from 'common/enums/activity-action-type';
import { UserActivity } from './entitites/user-activity.entity';

class CreateManualActivityDto {
  action: ActivityActionType;
  userId: number;
  details?: string;
  metadata?: Record<string, any>;
}

@ApiTags('user-activity')
@Controller('user-activity')
@UseGuards(JwtAuthGuard, AdminRightsGuard)
@ApiBearerAuth('access-token')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Get()
  @RequireAdminRights(['is_super_admin'])
  @ApiOperation({ summary: 'Get recent user activities' })
  @ApiResponse({
    status: 200,
    description: 'Return recent user activities based on filters',
    type: [UserActivity],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({
    name: 'adminId',
    required: false,
    type: Number,
    description: 'Filter by admin ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'actionType',
    required: false,
    enum: ActivityActionType,
    description: 'Filter by action type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  async getRecentActivities(
    @Query('page') page?: number,
    @Query('take') take?: number,
    @Query('adminId') adminId?: number,
    @Query('userId') userId?: number,
    @Query('actionType') actionType?: ActivityActionType,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    return this.userActivityService.getRecentActivities(
      page || 1,
      take || 10,
      adminId,
      userId,
      actionType,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined,
    );
  }

  @Get('statistics')
  @RequireAdminRights(['is_super_admin'])
  @ApiOperation({ summary: 'Get user activity statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return user activity statistics',
  })
  async getActivityStatistics() {
    return this.userActivityService.getActivityStatistics();
  }

  @Get('user/:userId')
  @RequireAdminRights(['is_super_admin', 'can_manage_users'])
  @ApiOperation({ summary: 'Get activities for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Return activities for a specific user',
    type: [UserActivity],
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  async getUserActivities(@Param('userId') userId: number) {
    return this.userActivityService.getRecentActivities(50, undefined, userId);
  }

  @Post('manual')
  @RequireAdminRights(['is_super_admin'])
  @ApiOperation({ summary: 'Manually create an activity log entry' })
  @ApiResponse({
    status: 201,
    description: 'Activity log entry created',
    type: UserActivity,
  })
  async createManualActivity(
    @Body() createActivityDto: CreateManualActivityDto,
  ) {
    return this.userActivityService.logActivity({
      action: createActivityDto.action,
      userId: createActivityDto.userId,
      details: createActivityDto.details,
      metadata: createActivityDto.metadata,
    });
  }

  @Delete('cleanup')
  @RequireAdminRights(['is_super_admin'])
  @ApiOperation({ summary: 'Clean up old activity logs' })
  @ApiResponse({
    status: 200,
    description: 'Number of deleted activity logs',
  })
  @ApiQuery({
    name: 'daysToKeep',
    required: false,
    type: Number,
    description: 'Number of days to keep activity logs',
  })
  async cleanupOldActivities(@Query('daysToKeep') daysToKeep?: number) {
    const deleted =
      await this.userActivityService.cleanupOldActivities(daysToKeep);
    return {
      deleted,
      message: `Successfully deleted ${deleted} old activity logs`,
    };
  }
}
