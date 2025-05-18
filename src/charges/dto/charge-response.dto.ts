import { ApiProperty } from '@nestjs/swagger';
import { ChargeStatus } from 'common/enums/charge-status';
import { PaymentPlatform } from 'common/enums/payment-platforms';

export class ChargeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  product: string;

  @ApiProperty({ enum: PaymentPlatform })
  payment_platform: PaymentPlatform;

  @ApiProperty({ enum: ChargeStatus })
  status: ChargeStatus;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
