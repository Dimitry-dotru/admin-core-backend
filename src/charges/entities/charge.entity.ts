import { Entity, Column } from 'typeorm';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { PaymentPlatform } from 'common/enums/payment-platforms';
import { ChargeStatus } from 'common/enums/charge-status';

@Entity()
export class Charge extends AbstractEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  product: string;

  @Column({
    type: 'enum',
    enum: PaymentPlatform,
  })
  payment_platform: PaymentPlatform;

  @Column({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.ACTIVE,
  })
  status: ChargeStatus;
}
