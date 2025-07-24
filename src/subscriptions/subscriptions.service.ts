import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { User } from '../entities/user.entity';
import { Creator } from '../entities/creator.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Creator)
    private readonly creatorRepository: Repository<Creator>,
  ) {}

  async createSession(fanId: string, creatorId: string) {
    const fan = await this.userRepository.findOne({ where: { id: fanId } });
    const creator = await this.creatorRepository.findOne({ where: { id: creatorId } });
    if (!fan || !creator) throw new Error('Fan or Creator not found');
    const sessionId = 'psp_session_' + Math.random().toString(36).slice(2, 8);
    const subscription = this.subscriptionRepository.create({ fan, creator, status: 'CREATED', sessionId });
    await this.subscriptionRepository.save(subscription);
    return {
      sessionId,
      paymentUrl: `https://psp.fakepay.com/${sessionId}`,
      metadata: { fanId, creatorId },
      status: 'CREATED',
    };
  }

  async handleWebhook(body: any, secret: string) {
    if (secret !== 'zU7RDqXOF859503MJlkCin') { // TODO: change to env variable
      throw new ForbiddenException('Invalid webhook secret');
    }
    // Here you would process the webhook, e.g., update subscription status
    const { sessionId, status } = body;
    const subscription = await this.subscriptionRepository.findOne({ where: { sessionId } });
    if (subscription) {
      subscription.status = status;
      await this.subscriptionRepository.save(subscription);
    }
    return { received: true, ...body };
  }
}
