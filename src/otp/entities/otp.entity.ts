import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OtpType } from 'common/enums/otp-type.enum';
import { OtpStatus } from 'common/enums/otp-status.enum';
import { AbstractEntity } from 'common/entities/abstract.entity';

@Entity()
export class OtpCode extends AbstractEntity {
  @Column()
  value: string;

  @Column()
  expiration_time: Date;

  @Column({
    type: 'enum',
    enum: OtpType,
  })
  type: OtpType;

  @Column({
    type: 'enum',
    enum: OtpStatus,
    default: OtpStatus.UNUSED,
  })
  status: OtpStatus;

  @ManyToOne(() => User, (user) => user.otps)
  user: User;
}
