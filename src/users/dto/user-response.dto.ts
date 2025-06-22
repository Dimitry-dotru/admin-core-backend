import { Exclude, Expose } from 'class-transformer';
import { User } from '../entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  is_verified: boolean;

  @Expose()
  is_blocked: boolean;

  @Expose()
  phone_number?: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
