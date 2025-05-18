import { Entity, Column } from 'typeorm';
import { AbstractEntity } from 'common/entities/abstract.entity';
// import { SupportMessage } from './support-message.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from 'common/enums/support-status.enum';

export const getRandomSatisfactionRating = (): number => {
  return Math.floor(Math.random() * 5) + 1;
};

export const getRandomReplyCount = (): number => {
  return Math.floor(Math.random() * 8) + 1;
};

@Entity()
export class SupportTicket extends AbstractEntity {
  @ApiProperty({ example: 'John Doessss' })
  @Column()
  requester_username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column()
  requester_email: string;

  @ApiProperty({ example: 'Issue with account login' })
  @Column()
  subject: string;

  @ApiProperty({ example: 'ABC Corp.' })
  @Column({ nullable: true })
  company_name: string;

  @ApiProperty({ example: TicketStatus.NEW, enum: TicketStatus })
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.NEW,
  })
  ticket_status: TicketStatus;

  @ApiProperty({ example: 'Technical Support' })
  @Column({ nullable: true })
  ticket_category_name: string;

  @ApiProperty({ example: new Date() })
  @Column({ nullable: true, type: 'datetime' })
  resolution_date: Date;

  @ApiProperty({ example: 3.5 })
  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  resolution_time_hours: number;

  @ApiProperty({ example: getRandomSatisfactionRating() })
  @Column({ nullable: true, type: 'int' })
  customer_satisfaction_rating: number;

  @ApiProperty({ example: getRandomReplyCount() })
  @Column({ nullable: true, type: 'int', default: 0 })
  reply_count: number;

  constructor(partial: Partial<SupportTicket>) {
    super(partial);
  }
}
