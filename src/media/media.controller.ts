import { Controller, Post, Get, Param, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthGuard } from '../auth/auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creator } from '../entities/creator.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('creators/:creatorId/medias')
@UseGuards(AuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    @InjectRepository(Creator)
    private readonly creatorRepository: Repository<Creator>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  async create(@Param('creatorId') creatorId: string, @Body() body: { mediaUrl: string; blurredMediaUrl: string }, @Req() req: any) {
    const creator = await this.creatorRepository.findOne({ where: { id: creatorId }, relations: ['user'] });
    if (!creator) throw new ForbiddenException('Creator not found');
    if (creator.user.id !== req.user.id) {
      throw new ForbiddenException('You are not the creator');
    }
    return this.mediaService.create(creatorId, body.mediaUrl, body.blurredMediaUrl);
  }

  @Get()
  async findAll(@Param('creatorId') creatorId: string, @Req() req: any) {
    const creator = await this.creatorRepository.findOne({ where: { id: creatorId }, relations: ['user'] });
    if (!creator) throw new ForbiddenException('Creator not found');
    if (creator.user.id === req.user.id) {
      return this.mediaService.findAll(creatorId, req);
    }
    // Check if user is an active subscriber
    const subscription = await this.subscriptionsService['subscriptionRepository'].findOne({
      where: {
        fan: { id: req.user.id },
        creator: { id: creatorId },
        status: 'ACTIVE',
      },
      relations: ['fan', 'creator'],
    });
    if (!subscription) {
      throw new ForbiddenException('You are not subscribed to this creator');
    }
    return this.mediaService.findAll(creatorId, req);
  }
}
