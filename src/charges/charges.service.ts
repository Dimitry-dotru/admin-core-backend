import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { Charge } from './entities/charge.entity';
import { Product } from 'src/products/entities/product.entity';

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

  async findAll(): Promise<Charge[]> {
    return await this.chargesRepository.find({
      relations: ['product'],
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
