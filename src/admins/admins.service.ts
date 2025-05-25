import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { User } from '../users/entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const user = this.usersRepository.create({
      username: createAdminDto.username,
      email: createAdminDto.email,
      password: await this.hashPassword(createAdminDto.password),
      phone_number: createAdminDto.phone_number,
      is_verified: true,
    });

    const savedUser = await this.usersRepository.save(user);

    const admin = this.adminsRepository.create({
      is_super_admin: createAdminDto.is_super_admin || false,
      can_manage_users: createAdminDto.can_manage_users || false,
    });

    admin.user = savedUser;

    return this.adminsRepository.save(admin);
  }

  async findAll(
    exceptUserId?: number,
    page = 1,
    take = 10,
  ): Promise<{ data: Admin[]; meta: any }> {
    const skip = (page - 1) * take;

    let queryBuilder = this.adminsRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user')
      .orderBy('admin.created_at', 'DESC')
      .skip(skip)
      .take(take);

    if (exceptUserId) {
      queryBuilder = queryBuilder.where('user.id != :exceptUserId', {
        exceptUserId,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        take,
        item_count: total,
        page_count: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!admin) {
      throw new HttpException(
        `Admin with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return admin;
  }

  async findByUserId(userId: number): Promise<Admin> {
    const admin = await this.adminsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!admin) {
      throw new HttpException(
        `Admin with user ID ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);

    if (
      updateAdminDto.username ||
      updateAdminDto.email ||
      updateAdminDto.password ||
      updateAdminDto.phone_number
    ) {
      await this.usersService.update(admin.user.id, {
        username: updateAdminDto.username,
        email: updateAdminDto.email,
        password: updateAdminDto.password,
        phone_number: updateAdminDto.phone_number,
      });
    }

    if (updateAdminDto.is_super_admin !== undefined) {
      admin.is_super_admin = updateAdminDto.is_super_admin;
    }

    if (updateAdminDto.can_manage_users !== undefined) {
      admin.can_manage_users = updateAdminDto.can_manage_users;
    }

    return await this.adminsRepository.save(admin);
  }

  async remove(id: number): Promise<void> {
    const admin = await this.adminsRepository.findOne({
      where: {
        user: {
          id,
        },
      },
    });

    if (!admin) {
      throw new HttpException(
        `Admin with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.adminsRepository.remove(admin);

    await this.usersService.remove(admin.user.id);
  }

  async toggleBan(id: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    user.is_blocked = !user.is_blocked;
    await this.usersRepository.save(user);
    return true;
  }
}
