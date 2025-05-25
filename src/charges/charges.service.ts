import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { Charge } from './entities/charge.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaymentPlatform } from 'common/enums/payment-platforms';
import { ChargeStatus } from 'common/enums/charge-status';

@Injectable()
export class ChargesService {
  constructor(
    @InjectRepository(Charge)
    private readonly chargesRepository: Repository<Charge>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createChargeDto: CreateChargeDto) {
    const product = await this.productsRepository.findOne({
      where: { id: createChargeDto.product_id },
    });

    if (!product) {
      throw new HttpException(
        `Product with ID ${createChargeDto.product_id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const charge = this.chargesRepository.create({
      ...createChargeDto,
      product,
    });

    return this.chargesRepository.save(charge);
  }

  async findAll(
    page = 1,
    take = 10,
    payment_platform?: PaymentPlatform,
    status?: ChargeStatus,
    start_date?: string,
    end_date?: string,
    product_name?: string,
  ) {
    const skip = (page - 1) * take;
    const where: FindOptionsWhere<Charge> = {};

    if (payment_platform) {
      where.payment_platform = payment_platform;
    }

    if (status) {
      where.status = status;
    }

    if (start_date && end_date) {
      where.date = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.date = Between(new Date(start_date), new Date());
    } else if (end_date) {
      const startDate = new Date(0);
      where.date = Between(startDate, new Date(end_date));
    }

    const queryBuilder = this.chargesRepository
      .createQueryBuilder('charge')
      .leftJoinAndSelect('charge.product', 'product')
      .where(where)
      .orderBy('charge.date', 'DESC')
      .skip(skip)
      .take(take);

    if (product_name) {
      queryBuilder.andWhere('product.name LIKE :productName', {
        productName: `%${product_name}%`,
      });
    }

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      meta: {
        page,
        take,
        item_count: total,
        page_count: Math.ceil(total / take),
      },
    };
  }

  async findAllRecent(limit: number = 7): Promise<Charge[]> {
    return await this.chargesRepository.find({
      relations: ['product'],
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<Charge> {
    const charge = await this.chargesRepository.findOne({
      where: { id },
    });

    if (!charge) {
      throw new HttpException(
        `Charge with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return charge;
  }
  async update(id: number, updateChargeDto: UpdateChargeDto): Promise<Charge> {
    const charge = await this.findOne(id);

    // if (updateChargeDto.user_id) {
    //   charge.user = { id: updateChargeDto.user_id } as any;
    //   delete updateChargeDto.user_id;
    // }

    const updatedCharge = Object.assign(charge, updateChargeDto);

    return await this.chargesRepository.save(updatedCharge);
  }

  async remove(id: number): Promise<void> {
    const charge = await this.findOne(id);
    await this.chargesRepository.remove(charge);
  }
}
