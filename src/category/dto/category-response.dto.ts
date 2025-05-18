import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Category } from '../entities/category.entity';
import { CategoryStatus } from 'common/enums/category-status';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  category_name: string;

  @Expose()
  @ApiProperty({ enum: CategoryStatus })
  status: CategoryStatus;

  @Expose()
  @ApiProperty()
  created_at: Date;

  @Expose()
  @ApiProperty()
  updated_at: Date;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
}
