import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductStatus } from 'common/enums/product-status';
import { StoreType } from 'common/enums/store-type.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Subscription' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com/icons/premium.png' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiProperty({ example: ProductStatus.ACTIVE, enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ example: StoreType.BOTH, enum: StoreType })
  @IsEnum(StoreType)
  @IsOptional()
  storeTypesAllowed?: StoreType;

  @ApiProperty({ example: 19.99 })
  @IsNumber()
  @Min(0)
  price: number;
}
