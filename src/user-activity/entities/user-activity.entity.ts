import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { ActivityActionType } from 'common/enums/activity-action-type';

@Entity()
export class UserActivity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ActivityActionType,
    default: ActivityActionType.VIEW,
  })
  action: ActivityActionType;

  @Column()
  user_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ nullable: true })
  admin_id: number;

  constructor(partial: Partial<UserActivity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
