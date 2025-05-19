import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Charge } from 'src/charges/entities/charge.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charge, User])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
