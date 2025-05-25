import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryStatus } from 'common/enums/category-status';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { category_name: createCategoryDto.category_name },
    });

    if (existingCategory) {
      throw new HttpException(
        `Category with name ${createCategoryDto.category_name} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async findAll(
    page = 1,
    take = 10,
  ): Promise<{
    data: Category[];
    meta: {
      page: number;
      take: number;
      item_count: number;
      page_count: number;
    };
  }> {
    const skip = (page - 1) * take;

    const [data, total] = await this.categoriesRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip,
      take,
    });

    return {
      data,
      meta: {
        page,
        take,
        item_count: total,
        page_count: Math.ceil(total / take),
      },
    };
  }

  async findActive(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      where: { status: CategoryStatus.ACTIVE },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (
      updateCategoryDto.category_name &&
      updateCategoryDto.category_name !== category.category_name
    ) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { category_name: updateCategoryDto.category_name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new HttpException(
          `Category with name ${updateCategoryDto.category_name} already exists`,
          HttpStatus.CONFLICT,
        );
      }
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }
}
