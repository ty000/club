import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from '../src/media/media.controller';
import { MediaService } from '../src/media/media.service';
import { SubscriptionsService } from '../src/subscriptions/subscriptions.service';
import { ForbiddenException } from '@nestjs/common';

const mockMediaService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

const mockCreatorRepository = {
  findOne: jest.fn(),
};

const mockSubscriptionsService = {
  subscriptionRepository: {
    findOne: jest.fn(),
  },
};

describe('MediaController', () => {
  let controller: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: MediaService, useValue: mockMediaService },
        { provide: 'CreatorRepository', useValue: mockCreatorRepository },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    })
      .overrideProvider('CreatorRepository')
      .useValue(mockCreatorRepository)
      .overrideProvider(MediaService)
      .useValue(mockMediaService)
      .overrideProvider(SubscriptionsService)
      .useValue(mockSubscriptionsService)
      .overrideGuard(require('../src/auth/auth.guard').AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MediaController>(MediaController);
    jest.clearAllMocks();
  });

  it('should allow creator to create media for their own profile', async () => {
    const creatorId = 'creator-1';
    const userId = 'user-1';
    const creator = { id: creatorId, user: { id: userId } };
    mockCreatorRepository.findOne.mockResolvedValueOnce(creator);
    mockMediaService.create.mockResolvedValueOnce({ mediaId: 'media-1', mediaUrl: 'url', blurredMediaUrl: 'blur' });
    const req = { user: { id: userId } };
    const body = { mediaUrl: 'url', blurredMediaUrl: 'blur' };
    await expect(controller.create(creatorId, body, req)).resolves.toEqual({ mediaId: 'media-1', mediaUrl: 'url', blurredMediaUrl: 'blur' });
    expect(mockMediaService.create).toHaveBeenCalledWith(creatorId, body.mediaUrl, body.blurredMediaUrl);
  });

  it('should forbid non-creator users from creating media for another creator', async () => {
    const creatorId = 'creator-1';
    const creator = { id: creatorId, user: { id: 'user-1' } };
    mockCreatorRepository.findOne.mockResolvedValueOnce(creator);
    const req = { user: { id: 'user-2' } };
    const body = { mediaUrl: 'url', blurredMediaUrl: 'blur' };
    await expect(controller.create(creatorId, body, req)).rejects.toThrow(ForbiddenException);
  });

  it('should return all media for a creator to the owner', async () => {
    const creatorId = 'creator-1';
    const userId = 'user-1';
    const creator = { id: creatorId, user: { id: userId } };
    mockCreatorRepository.findOne.mockResolvedValueOnce(creator);
    mockMediaService.findAll.mockResolvedValueOnce([
      { mediaId: 'media-1', mediaUrl: 'url', blurredMediaUrl: 'blur' },
    ]);
    const req = { user: { id: userId } };
    await expect(controller.findAll(creatorId, req)).resolves.toEqual([
      { mediaId: 'media-1', mediaUrl: 'url', blurredMediaUrl: 'blur' },
    ]);
  });

  it('should return all media for a creator to a subscribed user', async () => {
    const creatorId = 'creator-1';
    const creator = { id: creatorId, user: { id: 'user-1' } };
    mockCreatorRepository.findOne.mockResolvedValueOnce(creator);
    mockSubscriptionsService.subscriptionRepository.findOne.mockResolvedValueOnce({ status: 'ACTIVE' });
    mockMediaService.findAll.mockResolvedValueOnce([
      { mediaId: 'media-1', mediaUrl: 'url', blurredMediaUrl: 'blur' },
    ]);
    const req = { user: { id: 'user-2' } };
    await expect(controller.findAll(creatorId, req)).resolves.toEqual([
      { mediaId: 'media-1', mediaUrl: 'url', blurredMediaUrl: 'blur' },
    ]);
  });

  it('should forbid non-subscribed, non-owner users from accessing full media', async () => {
    const creatorId = 'creator-1';
    const creator = { id: creatorId, user: { id: 'user-1' } };
    mockCreatorRepository.findOne.mockResolvedValueOnce(creator);
    mockSubscriptionsService.subscriptionRepository.findOne.mockResolvedValueOnce(null);
    const req = { user: { id: 'user-3' } };
    await expect(controller.findAll(creatorId, req)).rejects.toThrow(ForbiddenException);
  });

  it('should return error if creator not found when creating media', async () => {
    mockCreatorRepository.findOne.mockResolvedValueOnce(null);
    const req = { user: { id: 'user-1' } };
    const body = { mediaUrl: 'url', blurredMediaUrl: 'blur' };
    await expect(controller.create('bad-id', body, req)).rejects.toThrow(ForbiddenException);
  });

  it('should return error if creator not found when fetching media', async () => {
    mockCreatorRepository.findOne.mockResolvedValueOnce(null);
    const req = { user: { id: 'user-1' } };
    await expect(controller.findAll('bad-id', req)).rejects.toThrow(ForbiddenException);
  });
});
