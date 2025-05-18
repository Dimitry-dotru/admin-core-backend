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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  AdminRightsGuard,
  RequireAdminRights,
} from 'src/auth/guards/admin-rights.guard';

@ApiTags('admins')
@Controller('admins')
@UseGuards(JwtAuthGuard, AdminRightsGuard)
@ApiBearerAuth('access-token')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'Return all admins' })
  findAll(@CurrentUser() user: User) {
    console.log('User:', user);
    return this.adminsService.findAll(user.id);
  }

  @Get(':id')
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiResponse({ status: 200, description: 'Return an admin by ID' })
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(+id);
  }

  @Patch(':id')
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Update an admin' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Delete an admin' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
