import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaymentPlatform } from 'common/enums/payment-platforms';
import { ChargeStatus } from 'common/enums/charge-status';

@Entity()
export class Charge extends AbstractEntity {
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Product, (product) => product.charges, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({
    type: 'enum',
    enum: PaymentPlatform,
    default: PaymentPlatform.STRIPE,
  })
  payment_platform: PaymentPlatform;

  @Column({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.INACTIVE,
  })
  status: ChargeStatus;

  @Column({ nullable: true })
  user_id: string;

  constructor(partial: Partial<Charge>) {
    super(partial);
  }
}
