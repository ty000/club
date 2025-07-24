import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../entities/media.entity';
import { Creator } from '../entities/creator.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Creator)
    private readonly creatorRepository: Repository<Creator>,
  ) {}

  async create(creatorId: string, mediaUrl: string, blurredMediaUrl: string) {
    const creator = await this.creatorRepository.findOne({ where: { id: creatorId } });
    if (!creator) throw new Error('Creator not found');
    const media = this.mediaRepository.create({ creator, mediaUrl, blurredMediaUrl });
    await this.mediaRepository.save(media);
    return media;
  }

  async findAll(creatorId: string, req: any) {
    return this.mediaRepository.find({ where: { creator: { id: creatorId } } });
  }
}
