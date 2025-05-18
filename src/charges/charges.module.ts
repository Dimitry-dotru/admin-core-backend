import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { Charge } from './entities/charge.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Charge, Product]), ProductsModule],
  controllers: [ChargesController],
  providers: [ChargesService],
})
export class ChargesModule {}
