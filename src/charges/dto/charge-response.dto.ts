import { ApiProperty } from '@nestjs/swagger';
import { ChargeStatus } from 'common/enums/charge-status';
import { PaymentPlatform } from 'common/enums/payment-platforms';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';

export class ChargeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty({
    type: () => ProductResponseDto,
    nullable: true,
    description: 'The associated product or null if no product is associated',
  })
  product: ProductResponseDto | null;

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
