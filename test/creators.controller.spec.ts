import { Test, TestingModule } from '@nestjs/testing';
import { CreatorsController } from '../src/creators/creators.controller';
import { CreatorsService } from '../src/creators/creators.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CreatorsController', () => {
  let controller: CreatorsController;
  let creatorsService: CreatorsService;

  const mockCreatorsService = {
    create: jest.fn(),
    findByUsername: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatorsController],
      providers: [
        {
          provide: CreatorsService,
          useValue: mockCreatorsService,
        },
        {
          provide: 'AuthGuard',
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: 'AuthService',
          useValue: {},
        },
      ],
    })
      .overrideGuard(require('../src/auth/auth.guard').AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<CreatorsController>(CreatorsController);
    creatorsService = module.get<CreatorsService>(CreatorsService);
    jest.clearAllMocks();
  });

  it('should create a new creator with unique username and monthly price', async () => {
    const result = { id: 'uuid-1', username: 'unique', monthlyPrice: 10 };
    mockCreatorsService.create.mockResolvedValueOnce(result);
    const body = { username: 'unique', monthlyPrice: 10 };
    await expect(controller.create(body)).resolves.toEqual(result);
    expect(mockCreatorsService.create).toHaveBeenCalledWith(body.username, body.monthlyPrice);
  });

  it('should not allow duplicate creator usernames', async () => {
    const error = new ConflictException('Username already exists');
    mockCreatorsService.create.mockRejectedValueOnce(error);
    const body = { username: 'duplicate', monthlyPrice: 20 };
    await expect(controller.create(body)).rejects.toThrow(ConflictException);
    expect(mockCreatorsService.create).toHaveBeenCalledWith(body.username, body.monthlyPrice);
  });

  it('should return creator profile by username', async () => {
    const result = { id: 'uuid-2', username: 'creator1', monthlyPrice: 15 };
    mockCreatorsService.findByUsername.mockResolvedValueOnce(result);
    await expect(controller.findOne('creator1')).resolves.toEqual(result);
    expect(mockCreatorsService.findByUsername).toHaveBeenCalledWith('creator1');
  });

  it('should return error if creator not found by username', async () => {
    const error = new NotFoundException('Creator not found');
    mockCreatorsService.findByUsername.mockRejectedValueOnce(error);
    await expect(controller.findOne('notfound')).rejects.toThrow(NotFoundException);
    expect(mockCreatorsService.findByUsername).toHaveBeenCalledWith('notfound');
  });
});
