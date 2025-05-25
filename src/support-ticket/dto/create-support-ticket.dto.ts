import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { TicketStatus } from 'common/enums/support-status.enum';
import { Type } from 'class-transformer';
import {
  getRandomReplyCount,
  getRandomSatisfactionRating,
} from '../entities/support-ticket.entity';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  requester_username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  requester_email: string;

  @ApiProperty({ example: 'ejedima260@gmail.com' })
  @IsEmail()
  assigned_to_mail: string;

  @ApiProperty({ example: 'Issue with account login' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'ABC Corp.', required: false })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiProperty({ example: 'Technical Support', required: false })
  @IsString()
  @IsOptional()
  ticket_category_name?: string;

  @ApiProperty({
    example: TicketStatus.NEW,
    enum: TicketStatus,
    required: false,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  ticket_status?: TicketStatus;

  @ApiProperty({
    example: 'I am experiencing difficulties logging into my account.',
    required: true,
  })
  @IsString()
  initial_message: string;

  @ApiProperty({
    example: new Date().toISOString(),
    required: false,
    description: 'Resolution date for already closed tickets',
  })
  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @ApiProperty({
    example: 3.5,
    required: false,
    description: 'Resolution time in hours for closed tickets',
  })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(240)
  @Type(() => Number)
  resolution_time_hours?: number;

  @ApiProperty({
    example: getRandomSatisfactionRating(),
    required: false,
    description: 'Customer satisfaction rating (1-5)',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  customer_satisfaction_rating?: number;

  @ApiProperty({
    example: getRandomReplyCount(),
    required: false,
    description: 'Number of replies in the ticket thread',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  reply_count?: number;
}
