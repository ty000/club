import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('sessions')
  createSession(@Body() body: { fanId: string; creatorId: string }) {
    return this.subscriptionsService.createSession(body.fanId, body.creatorId);
  }

  @Post('hook')
  handleWebhook(@Body() body: any, @Headers('x-webhook-secret') secret: string) {
    return this.subscriptionsService.handleWebhook(body, secret);
  }
}
