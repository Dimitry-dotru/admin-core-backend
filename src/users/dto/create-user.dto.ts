import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRoles } from 'common/enums/user-roles.enum';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEnum(UserRoles)
  @IsOptional()
  role?: UserRoles;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/[a-zA-Z]/, {
    message: 'Password must contain at least one letter.',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit.' })
  password: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsString()
  @IsOptional()
  phone_number?: string;
}
