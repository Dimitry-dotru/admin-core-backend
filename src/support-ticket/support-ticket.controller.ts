import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TicketStatus } from 'common/enums/support-status.enum';

@ApiTags('support-ticket')
@Controller('support-ticket')
export class SupportTicketController {
  constructor(private readonly supportTicketService: SupportTicketService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({
    status: 201,
    description: 'The ticket has been successfully created.',
  })
  create(@Body() createSupportTicketDto: CreateSupportTicketDto) {
    return this.supportTicketService.create(createSupportTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all support tickets with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'ticket_status', required: false, type: String })
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'end_date', required: false, type: String })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('ticket_status') ticket_status?: TicketStatus,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    console.log('Query with date:', start_date, end_date);
    return this.supportTicketService.findAll(
      page,
      take,
      ticket_status,
      start_date,
      end_date,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get statistics for support tickets' })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics for support tickets',
  })
  getStatistics() {
    return this.supportTicketService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a support ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a support ticket by ID',
  })
  findOne(@Param('id') id: string) {
    return this.supportTicketService.findOne(+id);
  }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a support ticket' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The ticket has been successfully updated.',
  // })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSupportTicketDto: UpdateSupportTicketDto,
  // ) {
  //   return this.supportTicketService.update(+id, updateSupportTicketDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete a support ticket' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The ticket has been successfully deleted.',
  // })
  // remove(@Param('id') id: string) {
  //   return this.supportTicketService.remove(+id);
  // }
}
