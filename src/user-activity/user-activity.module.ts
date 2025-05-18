import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivityService } from './user-activity.service';
import { UserActivity } from './entities/user-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivity])],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
