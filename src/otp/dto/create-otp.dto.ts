import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  Length,
} from 'class-validator';
import { OtpType } from 'common/enums/otp-type.enum';

export class CreateOtpDto {
  @ApiProperty({ example: '123456' })
  @IsNumberString()
  @Length(6, 6, { message: 'OTP must be a string with 6 characters' })
  value: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  expiration_minutes: number;

  @ApiProperty({ example: OtpType.VERIFY_ACCOUNT, enum: OtpType })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  user_id: number;
}
