import { PartialType } from '@nestjs/swagger';
import { CreateOtpDto } from './create-otp.dto';
import { IsEnum } from 'class-validator';
import { OtpStatus } from 'common/enums/otp-status.enum';

export class UpdateOtpDto extends PartialType(CreateOtpDto) {
  @IsEnum(OtpStatus)
  status: OtpStatus;
}
