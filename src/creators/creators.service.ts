import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creator } from '../entities/creator.entity';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectRepository(Creator)
    private readonly creatorRepository: Repository<Creator>,
  ) {}

  async create(username: string, monthlyPrice: number) {
    const exists = await this.creatorRepository.findOne({ where: { username } });
    if (exists) {
      throw new ConflictException('Username already exists');
    }
    const creator = this.creatorRepository.create({ username, monthlyPrice });
    await this.creatorRepository.save(creator);
    return creator;
  }

  async findByUsername(username: string) {
    const creator = await this.creatorRepository.findOne({ where: { username } });
    if (!creator) throw new NotFoundException('Creator not found');
    return creator;
  }
}
