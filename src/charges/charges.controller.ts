import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ChargeResponseDto } from './dto/charge-response.dto';
import { PaymentPlatform } from 'common/enums/payment-platforms';
import { ChargeStatus } from 'common/enums/charge-status';

@ApiTags('charges')
@Controller('charges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new charge' })
  @ApiResponse({
    status: 201,
    description: 'Charge created successfully',
    type: ChargeResponseDto,
  })
  create(@Body() createChargeDto: CreateChargeDto) {
    return this.chargesService.create(createChargeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all charges with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated charges with filters',
    type: [ChargeResponseDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'payment_platform',
    required: false,
    enum: PaymentPlatform,
    description: 'Filter by payment platform',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ChargeStatus,
    description: 'Filter by charge status',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'product_name',
    required: false,
    type: String,
    description: 'Filter by product name',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('payment_platform') payment_platform?: PaymentPlatform,
    @Query('status') status?: ChargeStatus,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('product_name') product_name?: string,
  ) {
    return this.chargesService.findAll(
      page,
      take,
      payment_platform,
      status,
      start_date,
      end_date,
      product_name,
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent 7 charges' })
  @ApiResponse({
    status: 200,
    description: 'Return recent 7 charges',
    type: [ChargeResponseDto],
  })
  findAllRecent() {
    return this.chargesService.findAllRecent(7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a charge by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a charge by ID',
    type: ChargeResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.chargesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a charge' })
  @ApiResponse({
    status: 200,
    description: 'Charge updated successfully',
    type: ChargeResponseDto,
  })
  update(@Param('id') id: string, @Body() updateChargeDto: UpdateChargeDto) {
    return this.chargesService.update(+id, updateChargeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a charge' })
  @ApiResponse({ status: 200, description: 'Charge deleted successfully' })
  remove(@Param('id') id: string) {
    return this.chargesService.remove(+id);
  }
}
