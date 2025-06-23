import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Charge } from '../charges/entities/charge.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Charge)
    private readonly chargeRepository: Repository<Charge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getRevenueForLastSixMonths(): Promise<Record<string, number>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const charges = await this.chargeRepository
      .createQueryBuilder('charge')
      .select('SUM(charge.amount)', 'total')
      .addSelect('YEAR(charge.date)', 'year')
      .addSelect('MONTH(charge.date)', 'month')
      .where('charge.date >= :startDate', { startDate: sixMonthsAgo })
      .groupBy('year, month')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany<{
        month: string;
        year: string;
        total: string;
      }>();

    const result: Record<string, number> = {};
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    charges.forEach((charge) => {
      const month = parseInt(charge.month, 10);
      const year = parseInt(charge.year, 10);
      const key = `${months[month]} ${year}`;
      result[key] = parseFloat(charge.total);
    });

    this.fillMissingMonths(result, 6);

    return result;
  }

  async getUserRegistrationsForLastSixMonths(): Promise<
    Record<string, number>
  > {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const registrations = await this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(user.id)', 'count')
      .addSelect('YEAR(user.created_at)', 'year')
      .addSelect('MONTH(user.created_at)', 'month')
      .where('user.created_at >= :startDate', { startDate: sixMonthsAgo })
      .groupBy('year, month')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany<{
        month: string;
        year: string;
        count: string;
      }>();

    const result: Record<string, number> = {};
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    registrations.forEach((reg) => {
      const month = parseInt(reg.month, 10);
      const year = parseInt(reg.year, 10);
      const key = `${months[month - 1]} ${year}`;
      result[key] = parseInt(reg.count, 10);
    });

    this.fillMissingMonths(result, 6);

    return result;
  }

  private fillMissingMonths(
    data: Record<string, number>,
    monthCount: number,
  ): void {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const today = new Date();
    const result = { ...data };

    for (let i = 0; i < monthCount; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;

      if (result[key] === undefined) {
        result[key] = 0;
      }
    }

    Object.keys(result).forEach((key) => {
      data[key] = result[key];
    });
  }
}
