import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should create a new user and return a token if email does not exist', async () => {
    const result = { id: 'uuid-1', token: 'token-1' };
    mockAuthService.login.mockResolvedValueOnce(result);
    const body = { email: 'new@example.com', password: 'pass123' };
    await expect(controller.login(body)).resolves.toEqual(result);
    expect(mockAuthService.login).toHaveBeenCalledWith(body.email, body.password);
  });

  it('should return a token for an existing user with correct password', async () => {
    const result = { id: 'uuid-2', token: 'token-2' };
    mockAuthService.login.mockResolvedValueOnce(result);
    const body = { email: 'existing@example.com', password: 'correctpass' };
    await expect(controller.login(body)).resolves.toEqual(result);
    expect(mockAuthService.login).toHaveBeenCalledWith(body.email, body.password);
  });

  it('should return an error for an existing user with incorrect password', async () => {
    const error = new UnauthorizedException('Invalid password');
    mockAuthService.login.mockRejectedValueOnce(error);
    const body = { email: 'existing@example.com', password: 'wrongpass' };
    await expect(controller.login(body)).rejects.toThrow(UnauthorizedException);
    expect(mockAuthService.login).toHaveBeenCalledWith(body.email, body.password);
  });
});
