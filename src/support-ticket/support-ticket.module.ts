import { Module } from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { SupportTicketController } from './support-ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from './entities/support-ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket])],
  controllers: [SupportTicketController],
  providers: [SupportTicketService],
})
export class SupportTicketModule {}
