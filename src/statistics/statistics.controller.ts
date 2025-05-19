import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('revenue/last-six-months')
  @ApiOperation({ summary: 'Get total revenue for last six months' })
  @ApiResponse({
    status: 200,
    description: 'Returns monthly revenue for the last six months',
    schema: {
      type: 'object',
      example: {
        'December 2024': 12500,
        'November 2024': 10200,
        'October 2024': 9800,
        'September 2024': 11500,
        'August 2024': 8900,
        'July 2024': 9600,
      },
    },
  })
  async getRevenueForLastSixMonths() {
    return this.statisticsService.getRevenueForLastSixMonths();
  }

  @Get('users/registrations/last-six-months')
  @ApiOperation({ summary: 'Get user registrations for last six months' })
  @ApiResponse({
    status: 200,
    description: 'Returns monthly user registrations for the last six months',
    schema: {
      type: 'object',
      example: {
        'December 2024': 25,
        'November 2024': 32,
        'October 2024': 18,
        'September 2024': 41,
        'August 2024': 30,
        'July 2024': 22,
      },
    },
  })
  async getUserRegistrationsForLastSixMonths() {
    return this.statisticsService.getUserRegistrationsForLastSixMonths();
  }
}
