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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
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
import { ConfigService } from '@nestjs/config';

@ApiTags('admins')
@Controller('admins')
@UseGuards(JwtAuthGuard, AdminRightsGuard)
@ApiBearerAuth('access-token')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly configService: ConfigService,
  ) {
    void this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') || 'Admin123456';
    const adminUsername =
      this.configService.get<string>('ADMIN_USERNAME') || 'admin';

    try {
      try {
        const admins = await this.adminsService.findAll();

        const adminExists = admins.data.some(
          (admin) => admin.user.email === adminEmail,
        );

        if (adminExists) {
          console.log(
            `Admin with email ${adminEmail} already exists. Skipping creation.`,
          );
          return;
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }

      await this.adminsService.create({
        email: adminEmail,
        password: adminPassword,
        username: adminUsername,
        is_super_admin: true,
        can_manage_users: true,
        can_manage_content: true,
      });

      console.log('Default admin created successfully!');
    } catch (error) {
      console.error('Failed to create default admin:', error);
    }
  }

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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('take') take?: number,
  ) {
    console.log('User:', user);
    return this.adminsService.findAll(user.id, page || 1, take || 10);
  }

  @Get(':id')
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiResponse({ status: 200, description: 'Return an admin by ID' })
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(+id);
  }

  @Post('toggle-ban/:id')
  @RequireAdminRights(['can_manage_users'])
  @ApiOperation({ summary: 'Block admin by id' })
  @ApiResponse({
    status: 200,
    description: 'Return boolean of success of operation',
  })
  block(@Param('id') id: number) {
    console.log('Toggling...', id);
    return this.adminsService.toggleBan(id);
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
