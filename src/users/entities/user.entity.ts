import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';
import { OtpCode } from 'src/otp/entities/otp.entity';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { UserRoles } from 'common/enums/user-roles.enum';

@Entity()
export class User extends AbstractEntity {
  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: UserRoles.EDITOR })
  role: UserRoles;

  @Column({ default: false })
  is_blocked: boolean;

  @Column({ nullable: true })
  phone_number?: string;

  @OneToMany(() => OtpCode, (otp) => otp.user)
  otps: OtpCode[];

  @OneToOne(() => Admin, (admin) => admin.user, {
    nullable: false,
    onDelete: 'CASCADE',
    cascade: false,
  })
  @JoinColumn()
  admin: Admin;
}
