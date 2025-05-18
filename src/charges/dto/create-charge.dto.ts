import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentPlatform } from 'common/enums/payment-platforms';
import { ChargeStatus } from 'common/enums/charge-status';

export class CreateChargeDto {
  @ApiProperty({ example: '2025-05-17' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Premium Subscription' })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ example: PaymentPlatform.STRIPE, enum: PaymentPlatform })
  @IsEnum(PaymentPlatform)
  payment_platform: PaymentPlatform;

  @ApiProperty({
    example: ChargeStatus.ACTIVE,
    enum: ChargeStatus,
    required: false,
  })
  @IsEnum(ChargeStatus)
  status?: ChargeStatus;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
