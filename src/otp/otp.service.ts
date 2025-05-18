import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';
import { OtpCode } from './entities/otp.entity';
import { OtpStatus } from 'common/enums/otp-status.enum';
import { OtpType } from 'common/enums/otp-type.enum';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
  ) {}

  async create(createOtpDto: CreateOtpDto): Promise<OtpCode> {
    // Инвалидируем все предыдущие неиспользованные OTP того же типа для этого пользователя
    await this.otpRepository.update(
      {
        user: { id: createOtpDto.user_id },
        type: createOtpDto.type,
        status: OtpStatus.UNUSED,
      },
      { status: OtpStatus.INVALID },
    );

    // Создаем время истечения OTP
    const now = new Date();
    const expirationTime = new Date(
      now.getTime() + createOtpDto.expiration_minutes * 60 * 1000,
    );

    // Создаем новый OTP
    const otpCode = this.otpRepository.create({
      value: createOtpDto.value,
      expiration_time: expirationTime,
      type: createOtpDto.type,
      user: { id: createOtpDto.user_id },
    });

    return await this.otpRepository.save(otpCode);
  }

  async findAll(): Promise<OtpCode[]> {
    return await this.otpRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<OtpCode> {
    const otpCode = await this.otpRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!otpCode) {
      throw new HttpException(
        `OTP with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return otpCode;
  }

  async findValidOtp(
    userId: number,
    otpValue: string,
    otpType: OtpType,
  ): Promise<OtpCode> {
    const now = new Date();

    const otpCode = await this.otpRepository.findOne({
      where: {
        user: { id: userId },
        value: otpValue,
        type: otpType,
        status: OtpStatus.UNUSED,
        expiration_time: LessThan(now),
      },
      relations: ['user'],
    });

    if (!otpCode) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }

    return otpCode;
  }

  async update(id: number, updateOtpDto: UpdateOtpDto): Promise<OtpCode> {
    const otpCode = await this.findOne(id);

    const updatedOtp = Object.assign(otpCode, updateOtpDto);

    return await this.otpRepository.save(updatedOtp);
  }

  async remove(id: number): Promise<void> {
    const otpCode = await this.findOne(id);
    await this.otpRepository.remove(otpCode);
  }

  // Удаляет просроченные OTP
  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();

    await this.otpRepository.update(
      {
        expiration_time: LessThan(now),
        status: OtpStatus.UNUSED,
      },
      { status: OtpStatus.INVALID },
    );
  }
}
