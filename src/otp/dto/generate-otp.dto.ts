import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { OtpType } from 'common/enums/otp-type.enum';

export class GenerateOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: OtpType.VERIFY_ACCOUNT, enum: OtpType })
  @IsEnum(OtpType)
  type: OtpType;
}
