import { Entity, OneToOne, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { UserActivity } from 'src/user-activity/entities/user-activity.entity';

@Entity()
export class Admin extends AbstractEntity {
  @OneToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: true })
  is_super_admin: boolean;

  @Column({ default: false })
  can_manage_users: boolean;

  @OneToMany(() => UserActivity, (activity) => activity.admin)
  activities: UserActivity[];
}
