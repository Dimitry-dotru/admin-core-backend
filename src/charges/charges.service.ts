import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { Charge } from './entities/charge.entity';

@Injectable()
export class ChargesService {
  constructor(
    @InjectRepository(Charge)
    private readonly chargeRepository: Repository<Charge>,
  ) {}

  async create(createChargeDto: CreateChargeDto): Promise<Charge> {
    const charge = this.chargeRepository.create({
      date: createChargeDto.date,
      amount: createChargeDto.amount,
      product: createChargeDto.product,
      payment_platform: createChargeDto.payment_platform,
      status: createChargeDto.status,
    });

    return await this.chargeRepository.save(charge);
  }

  async findAll(): Promise<Charge[]> {
    return await this.chargeRepository.find();
  }

  async findOne(id: number): Promise<Charge> {
    const charge = await this.chargeRepository.findOne({
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

    return await this.chargeRepository.save(updatedCharge);
  }

  async remove(id: number): Promise<void> {
    const charge = await this.findOne(id);
    await this.chargeRepository.remove(charge);
  }
}
