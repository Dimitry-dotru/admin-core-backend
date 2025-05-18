import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  old_password: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit.' })
  @Matches(/[a-zA-Z]/, {
    message: 'Password must contain at least one letter.',
  })
  new_password: string;
}
