import { Entity, OneToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AbstractEntity } from 'common/entities/abstract.entity';

@Entity()
export class Admin extends AbstractEntity {
  @OneToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: true })
  is_super_admin: boolean;

  @Column({ default: false })
  can_manage_users: boolean;

  @Column({ default: false })
  can_manage_content: boolean;
}
