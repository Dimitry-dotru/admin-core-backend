import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { StoreType } from 'common/enums/store-type.enum';
import { Charge } from '../../charges/entities/charge.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from 'common/enums/product-status';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class Product extends AbstractEntity {
  @ApiProperty({ example: 'Premium Subscription' })
  @Column()
  name: string;

  @ApiProperty({ example: 'https://example.com/icons/premium.png' })
  @Column({ nullable: true })
  iconUrl: string;

  @ApiProperty({ example: ProductStatus.ACTIVE, enum: ProductStatus })
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @ApiProperty({ example: StoreType.BOTH, enum: StoreType })
  @Column({
    type: 'enum',
    enum: StoreType,
    default: StoreType.BOTH,
  })
  storeTypesAllowed: StoreType;

  @ApiProperty({ example: 19.99 })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @OneToMany(() => Charge, (charge) => charge.product, { nullable: true })
  charges: Charge[];

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  constructor(partial: Partial<Product>) {
    super(partial);
  }
}
