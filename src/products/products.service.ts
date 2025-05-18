import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from 'common/enums/product-status';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryIds, ...productData } = createProductDto;

    const product = this.productsRepository.create(productData);

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoriesRepository.findBy({
        id: In(categoryIds),
      });

      if (categories.length !== categoryIds.length) {
        throw new HttpException(
          'One or more categories not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      product.categories = categories;
    }

    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      relations: ['categories'],
    });
  }

  async findActive(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ['categories'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { categoryIds, ...productData } = updateProductDto;

    const product = await this.findOne(id);

    Object.assign(product, productData);

    if (categoryIds) {
      if (categoryIds.length > 0) {
        const categories = await this.categoriesRepository.findBy({
          id: In(categoryIds),
        });

        if (categories.length !== categoryIds.length) {
          throw new HttpException(
            'One or more categories not found',
            HttpStatus.BAD_REQUEST,
          );
        }

        product.categories = categories;
      } else {
        product.categories = [];
      }
    }

    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
