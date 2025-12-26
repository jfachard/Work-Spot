import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerUser: jest.fn(),
    findUserByEmail: jest.fn(),
    loginUser: jest.fn(),
    verifyToken: jest.fn(),
    findUserById: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockAuthService.registerUser.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
      expect(authService.registerUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.findUserByEmail.mockResolvedValue(user);
      mockAuthService.loginUser.mockResolvedValue(tokens);

      const result = await controller.login(loginDto);

      expect(result).toEqual(tokens);
      expect(authService.findUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.loginUser).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockAuthService.findUserByEmail.mockResolvedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: '1', email: 'test@example.com' };
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.verifyToken.mockResolvedValue(payload);
      mockAuthService.findUserById.mockResolvedValue(user);
      mockAuthService.loginUser.mockResolvedValue(newTokens);

      const result = await controller.refresh(refreshToken);

      expect(result).toEqual(newTokens);
      expect(authService.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(authService.findUserById).toHaveBeenCalledWith(payload.sub);
      expect(authService.loginUser).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const refreshToken = 'invalid-token';

      mockAuthService.verifyToken.mockResolvedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: '1', email: 'test@example.com' };

      mockAuthService.verifyToken.mockResolvedValue(payload);
      mockAuthService.findUserById.mockResolvedValue(null);

      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
