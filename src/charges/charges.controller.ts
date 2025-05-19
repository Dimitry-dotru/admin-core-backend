import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
} from '@nestjs/swagger';
import { ChargeResponseDto } from './dto/charge-response.dto';

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
  @ApiOperation({ summary: 'Get all charges' })
  @ApiResponse({
    status: 200,
    description: 'Return all charges',
    type: [ChargeResponseDto],
  })
  findAll() {
    return this.chargesService.findAll();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent 7 charges' })
  @ApiResponse({
    status: 200,
    description: 'Return recent 7 charges',
    type: [ChargeResponseDto],
  })
  findAllRecent() {
    return this.chargesService.findAll(7);
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
