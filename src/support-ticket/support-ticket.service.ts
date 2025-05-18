import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm';
import { TicketStatus } from 'common/enums/support-status.enum';

interface CountResult {
  count: string;
}

interface AvgResolutionTimeResult {
  avgTimeHours: string | null;
}

interface AvgRepliesResult {
  avgReplies: string | null;
}

interface StatusCountResult {
  ticket_status: string;
  count: string;
}

interface CategoryCountResult {
  category: string;
  count: string;
}

interface DateCountResult {
  date: string;
  count: string;
}

@Injectable()
export class SupportTicketService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepository: Repository<SupportTicket>,
  ) {}

  async create(createSupportTicketDto: CreateSupportTicketDto) {
    return await this.supportTicketRepository.save(createSupportTicketDto);
  }

  async findAll(
    page = 1,
    take = 10,
    ticket_status?: TicketStatus,
    company_name?: string,
    start_date?: string,
    end_date?: string,
  ) {
    const skip = (page - 1) * take;
    const where: FindOptionsWhere<SupportTicket> = {};

    if (ticket_status) {
      where.ticket_status = ticket_status;
    }

    if (company_name) {
      where.company_name = Like(`%${company_name}%`);
    }

    if (start_date && end_date) {
      where.created_at = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.created_at = Between(new Date(start_date), new Date());
    } else if (end_date) {
      const startDate = new Date(0); // January 1, 1970
      where.created_at = Between(startDate, new Date(end_date));
    }

    const [result, total] = await this.supportTicketRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take,
    });

    return {
      data: result,
      meta: {
        page,
        take,
        item_count: total,
        page_count: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const ticket = await this.supportTicketRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async getStatistics() {
    // Get tickets count by status
    const statusCounts = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('ticket.ticket_status', 'ticket_status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.ticket_status')
      .getRawMany();

    // Get average resolution time
    const avgResolutionTime = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('AVG(ticket.resolution_time_hours)', 'avgTimeHours')
      .where('ticket.resolution_time_hours IS NOT NULL')
      .getRawOne<AvgResolutionTimeResult>();

    // Get average replies to closing
    const avgReplies = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('AVG(ticket.reply_count)', 'avgReplies')
      .where('ticket.ticket_status = :status', { status: 'closed' })
      .andWhere('ticket.reply_count > 0')
      .getRawOne<AvgRepliesResult>();

    // Get satisfaction ratings distribution
    const fiveStars = await this.getCountBySatisfactionRating(5);
    const fourStars = await this.getCountBySatisfactionRating(4);
    const threeStars = await this.getCountBySatisfactionRating(3);
    const twoStars = await this.getCountBySatisfactionRating(2);
    const oneStar = await this.getCountBySatisfactionRating(1);

    // Get tickets created by date (for chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ticketsByDate = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('DATE(ticket.created_at)', 'date')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('ticket.created_at >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Organize all statistics in a structured format
    return {
      statusCounts,
      ticketsByDate,
      resolution: {
        avgTimeHours: avgResolutionTime?.avgTimeHours || 0,
        avgReplies: avgReplies?.avgReplies || 0,
      },
      satisfaction: {
        fiveStars,
        fourStars,
        threeStars,
        twoStars,
        oneStar,
        avgRating: this.calculateAverageRating(
          fiveStars,
          fourStars,
          threeStars,
          twoStars,
          oneStar,
        ),
      },
    };
  }

  private async getCountBySatisfactionRating(rating: number): Promise<number> {
    const result = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('COUNT(ticket.id)', 'count')
      .where('ticket.customer_satisfaction_rating = :rating', { rating })
      .getRawOne<CountResult>();

    return result ? parseInt(result.count) : 0;
  }

  private calculateAverageRating(
    fiveStars: number,
    fourStars: number,
    threeStars: number,
    twoStars: number,
    oneStar: number,
  ): number {
    const totalRatings =
      fiveStars + fourStars + threeStars + twoStars + oneStar;

    if (totalRatings === 0) return 0;

    const weightedSum =
      5 * fiveStars +
      4 * fourStars +
      3 * threeStars +
      2 * twoStars +
      1 * oneStar;

    return parseFloat((weightedSum / totalRatings).toFixed(1));
  }
}
