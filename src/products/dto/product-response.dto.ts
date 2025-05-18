import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { StoreType } from 'common/enums/store-type.enum';
import { Product } from '../entities/product.entity';
import { ProductStatus } from 'common/enums/product-status';

@Exclude()
export class ProductResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  iconUrl: string;

  @Expose()
  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;

  @Expose()
  @ApiProperty({ enum: StoreType })
  storeTypesAllowed: StoreType;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  created_at: Date;

  @Expose()
  @ApiProperty()
  updated_at: Date;

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }
}
