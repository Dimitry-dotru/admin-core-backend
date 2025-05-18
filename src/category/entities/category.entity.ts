import { Entity, Column, ManyToMany } from 'typeorm';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { Product } from 'src/products/entities/product.entity';
import { CategoryStatus } from 'common/enums/category-status';

@Entity()
export class Category extends AbstractEntity {
  @Column()
  category_name: string;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];

  constructor(partial: Partial<Category>) {
    super(partial);
  }
}
