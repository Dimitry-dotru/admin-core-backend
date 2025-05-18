import { Entity, OneToOne, Column } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Admin extends AbstractEntity {
  @OneToOne(() => User, (user) => user.admin)
  user: User;

  @Column({ default: true })
  is_super_admin: boolean;

  @Column({ default: false })
  can_manage_users: boolean;

  @Column({ default: false })
  can_manage_content: boolean;
}
