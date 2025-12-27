import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getProfile: jest.fn(),
    getUserStats: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: {
      sub: 'user-1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUserService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(userService.getProfile).toHaveBeenCalledWith('user-1');
      expect(userService.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token', async () => {
      mockUserService.getProfile.mockResolvedValue(mockUser);

      await controller.getProfile(mockRequest);

      expect(userService.getProfile).toHaveBeenCalledWith(
        mockRequest.user.sub,
      );
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      const stats = {
        spotsCreated: 5,
        reviewsWritten: 10,
        favoriteSpots: 15,
      };

      mockUserService.getUserStats.mockResolvedValue(stats);

      const result = await controller.getStats(mockRequest);

      expect(result).toEqual(stats);
      expect(userService.getUserStats).toHaveBeenCalledWith('user-1');
      expect(userService.getUserStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(updateUserDto, mockRequest);

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith('user-1', updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Only Name Update',
      };

      const updatedUser = {
        ...mockUser,
        name: 'Only Name Update',
      };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(updateUserDto, mockRequest);

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith('user-1', updateUserDto);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123!',
      };

      const response = { message: 'Password updated successfully' };

      mockUserService.changePassword.mockResolvedValue(response);

      const result = await controller.changePassword(
        changePasswordDto,
        mockRequest,
      );

      expect(result).toEqual(response);
      expect(userService.changePassword).toHaveBeenCalledWith(
        'user-1',
        changePasswordDto,
      );
      expect(userService.changePassword).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123!',
      };

      const response = { message: 'Password updated successfully' };

      mockUserService.changePassword.mockResolvedValue(response);

      await controller.changePassword(changePasswordDto, mockRequest);

      expect(userService.changePassword).toHaveBeenCalledWith(
        mockRequest.user.sub,
        changePasswordDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete user account', async () => {
      const deleteResponse = { message: 'Account deleted successfully' };

      mockUserService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(userService.remove).toHaveBeenCalledWith('user-1');
      expect(userService.remove).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token for deletion', async () => {
      const deleteResponse = { message: 'Account deleted successfully' };

      mockUserService.remove.mockResolvedValue(deleteResponse);

      await controller.remove(mockRequest);

      expect(userService.remove).toHaveBeenCalledWith(mockRequest.user.sub);
    });
  });
});
