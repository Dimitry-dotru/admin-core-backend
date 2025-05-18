import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { CategoryStatus } from 'common/enums/category-status';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  category_name: string;

  @ApiProperty({ example: CategoryStatus.ACTIVE, enum: CategoryStatus })
  @IsEnum(CategoryStatus)
  status: CategoryStatus;
}
