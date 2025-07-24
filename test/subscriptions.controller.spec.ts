import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from '../src/subscriptions/subscriptions.controller';
import { SubscriptionsService } from '../src/subscriptions/subscriptions.service';

const mockSubscriptionsService = {
  createSession: jest.fn(),
  handleWebhook: jest.fn(),
};

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    })
      .overrideProvider(SubscriptionsService)
      .useValue(mockSubscriptionsService)
      .overrideGuard(require('../src/auth/auth.guard').AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    jest.clearAllMocks();
  });

  it('should accept webhook with correct X-Webhook-Secret header', async () => {
    const result = { received: true, sessionId: 'psp_session_abc123', status: 'SUCCESS' };
    mockSubscriptionsService.handleWebhook.mockResolvedValueOnce(result);
    const body = { sessionId: 'psp_session_abc123', status: 'SUCCESS' };
    const secret = 'zU7RDqXOF859503MJlkCin';
    await expect(controller.handleWebhook(body, secret)).resolves.toEqual(result);
    expect(mockSubscriptionsService.handleWebhook).toHaveBeenCalledWith(body, secret);
  });

  it('should reject webhook with missing or incorrect X-Webhook-Secret header', async () => {
    const error = new Error('Invalid webhook secret');
    mockSubscriptionsService.handleWebhook.mockRejectedValueOnce(error);
    const body = { sessionId: 'psp_session_abc123', status: 'FAILED' };
    const secret = 'wrong-secret';
    await expect(controller.handleWebhook(body, secret)).rejects.toThrow('Invalid webhook secret');
    expect(mockSubscriptionsService.handleWebhook).toHaveBeenCalledWith(body, secret);
  });

  it('should update subscription status to SUCCESS on successful webhook', async () => {
    const result = { received: true, sessionId: 'psp_session_abc123', status: 'SUCCESS' };
    mockSubscriptionsService.handleWebhook.mockResolvedValueOnce(result);
    const body = { sessionId: 'psp_session_abc123', status: 'SUCCESS' };
    const secret = 'zU7RDqXOF859503MJlkCin';
    const response = await controller.handleWebhook(body, secret);
    expect(response.status).toBe('SUCCESS');
    expect(response.sessionId).toBe('psp_session_abc123');
    expect(response.received).toBe(true);
  });

  it('should update subscription status to FAILED on failed webhook', async () => {
    const result = { received: true, sessionId: 'psp_session_abc123', status: 'FAILED' };
    mockSubscriptionsService.handleWebhook.mockResolvedValueOnce(result);
    const body = { sessionId: 'psp_session_abc123', status: 'FAILED' };
    const secret = 'zU7RDqXOF859503MJlkCin';
    const response = await controller.handleWebhook(body, secret);
    expect(response.status).toBe('FAILED');
    expect(response.sessionId).toBe('psp_session_abc123');
    expect(response.received).toBe(true);
  });

  it('should return received webhook data in response', async () => {
    const result = { received: true, sessionId: 'psp_session_abc123', status: 'SUCCESS', extra: 'data' };
    mockSubscriptionsService.handleWebhook.mockResolvedValueOnce(result);
    const body = { sessionId: 'psp_session_abc123', status: 'SUCCESS', extra: 'data' };
    const secret = 'zU7RDqXOF859503MJlkCin';
    await expect(controller.handleWebhook(body, secret)).resolves.toEqual(result);
  });

  it('should create a payment session for a fan and creator', async () => {
    const result = {
      sessionId: 'psp_session_abc123',
      paymentUrl: 'https://psp.fakepay.com/psp_session_abc123',
      metadata: { fanId: 'fan-1', creatorId: 'creator-1' },
      status: 'CREATED',
    };
    mockSubscriptionsService.createSession.mockResolvedValueOnce(result);
    const body = { fanId: 'fan-1', creatorId: 'creator-1' };
    await expect(controller.createSession(body)).resolves.toEqual(result);
    expect(mockSubscriptionsService.createSession).toHaveBeenCalledWith(body.fanId, body.creatorId);
  });

  it('should return error if fan or creator does not exist', async () => {
    const error = new Error('Fan or Creator not found');
    mockSubscriptionsService.createSession.mockRejectedValueOnce(error);
    const body = { fanId: 'bad-fan', creatorId: 'bad-creator' };
    await expect(controller.createSession(body)).rejects.toThrow('Fan or Creator not found');
    expect(mockSubscriptionsService.createSession).toHaveBeenCalledWith(body.fanId, body.creatorId);
  });

  it('should return correct sessionId, paymentUrl, and metadata in response', async () => {
    const result = {
      sessionId: 'psp_session_xyz789',
      paymentUrl: 'https://psp.fakepay.com/psp_session_xyz789',
      metadata: { fanId: 'fan-2', creatorId: 'creator-2' },
      status: 'CREATED',
    };
    mockSubscriptionsService.createSession.mockResolvedValueOnce(result);
    const body = { fanId: 'fan-2', creatorId: 'creator-2' };
    const response = await controller.createSession(body);
    expect(response.sessionId).toBe('psp_session_xyz789');
    expect(response.paymentUrl).toBe('https://psp.fakepay.com/psp_session_xyz789');
    expect(response.metadata).toEqual({ fanId: 'fan-2', creatorId: 'creator-2' });
    expect(response.status).toBe('CREATED');
  });
});
