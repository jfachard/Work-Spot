import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    spot: {
      count: jest.fn(),
    },
    review: {
      count: jest.fn(),
    },
    favorite: {
      count: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithoutPassword,
      );

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUserWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('user-999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('user-999')).rejects.toThrow(
        'User with ID user-999 not found',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithoutPassword,
      );

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockUserWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update user profile successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      };

      const updatedUser = {
        ...mockUserWithoutPassword,
        ...updateUserDto,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw BadRequestException when no data provided', async () => {
      const updateUserDto: UpdateUserDto = {};

      await expect(service.update('user-1', updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('user-1', updateUserDto)).rejects.toThrow(
        'No data provided for update',
      );
    });

    it('should update email if not already in use', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUserWithoutPassword,
        email: 'newemail@example.com',
      });

      const result = await service.update('user-1', updateUserDto);

      expect(result.email).toBe('newemail@example.com');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newemail@example.com' },
      });
    });

    it('should throw BadRequestException when email already in use by another user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'other-user',
        email: 'existing@example.com',
      });

      await expect(service.update('user-1', updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('user-1', updateUserDto)).rejects.toThrow(
        'Email already in use',
      );
    });

    it('should allow updating to same email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@example.com',
        name: 'New Name',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUserWithoutPassword,
        name: 'New Name',
      });

      const result = await service.update('user-1', updateUserDto);

      expect(result).toBeDefined();
      expect(prismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123!',
      };

      const newHashedPassword = 'new-hashed-password';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword('user-1', changePasswordDto);

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'oldPassword',
        'hashed-password',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123!', 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: newHashedPassword },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('user-999', changePasswordDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.changePassword('user-999', changePasswordDto),
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('remove', () => {
    it('should delete user account successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('user-1');

      expect(result).toEqual({ message: 'Account deleted successfully' });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('user-999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('user-999')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockPrismaService.spot.count.mockResolvedValue(5);
      mockPrismaService.review.count.mockResolvedValue(10);
      mockPrismaService.favorite.count.mockResolvedValue(15);

      const result = await service.getUserStats('user-1');

      expect(result).toEqual({
        spotsCreated: 5,
        reviewsWritten: 10,
        favoriteSpots: 15,
      });
      expect(prismaService.spot.count).toHaveBeenCalledWith({
        where: { createdById: 'user-1' },
      });
      expect(prismaService.review.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prismaService.favorite.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return zero stats for new user', async () => {
      mockPrismaService.spot.count.mockResolvedValue(0);
      mockPrismaService.review.count.mockResolvedValue(0);
      mockPrismaService.favorite.count.mockResolvedValue(0);

      const result = await service.getUserStats('user-1');

      expect(result).toEqual({
        spotsCreated: 0,
        reviewsWritten: 0,
        favoriteSpots: 0,
      });
    });
  });
});
