import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const hashedPassword = 'hashed-password';
      const createdUser = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.registerUser(registerDto);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
        },
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.registerUser(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const user = {
        id: '1',
        email,
        password: 'hashed-password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.findUserByEmail(email, password);

      expect(result).toEqual({
        id: '1',
        email,
        name: 'Test User',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it('should return UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserByEmail(
        'test@example.com',
        'Password123!',
      );

      expect(result).toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.findUserByEmail('test@example.com', 'WrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.findUserByEmail('test@example.com', 'WrongPassword'),
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('loginUser', () => {
    it('should return access and refresh tokens', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
      };

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.loginUser(user);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: user.id, email: user.email },
        { expiresIn: '1h' },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: user.id, email: user.email },
        { expiresIn: '7d' },
      );
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload when token is valid', async () => {
      const token = 'valid-token';
      const payload = { sub: '1', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.verifyToken(token);

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_SECRET,
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const token = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyToken(token)).rejects.toThrow(
        'Invalid token',
      );
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      const userId = '1';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findUserById(userId);

      expect(result).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserById('999');

      expect(result).toBeNull();
    });
  });
});
