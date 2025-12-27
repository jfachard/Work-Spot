import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    spot: {
      findUnique: jest.fn(),
    },
    favorite: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSpot = {
    id: 'spot-1',
    name: 'Test Café',
    description: 'A nice café',
    address: '123 Test St',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    hasWifi: true,
    hasPower: true,
    createdById: 'user-2',
  };

  const mockFavorite = {
    id: 'favorite-1',
    userId: 'user-1',
    spotId: 'spot-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should add a spot to favorites successfully', async () => {
      const createFavoriteDto: CreateFavoriteDto = {
        spotId: 'spot-1',
      };

      const favoriteWithSpot = {
        ...mockFavorite,
        spot: {
          ...mockSpot,
          createdBy: {
            id: 'user-2',
            name: 'Spot Owner',
            email: 'owner@example.com',
          },
        },
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.favorite.findUnique.mockResolvedValue(null);
      mockPrismaService.favorite.create.mockResolvedValue(favoriteWithSpot);

      const result = await service.create('user-1', createFavoriteDto);

      expect(result).toEqual(favoriteWithSpot);
      expect(prismaService.spot.findUnique).toHaveBeenCalledWith({
        where: { id: 'spot-1' },
      });
      expect(prismaService.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_spotId: {
            userId: 'user-1',
            spotId: 'spot-1',
          },
        },
      });
      expect(prismaService.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          spotId: 'spot-1',
        },
        include: {
          spot: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when spot does not exist', async () => {
      const createFavoriteDto: CreateFavoriteDto = {
        spotId: 'spot-999',
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', createFavoriteDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create('user-1', createFavoriteDto),
      ).rejects.toThrow('Spot with ID spot-999 not found');
    });

    it('should throw BadRequestException when spot is already in favorites', async () => {
      const createFavoriteDto: CreateFavoriteDto = {
        spotId: 'spot-1',
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.favorite.findUnique.mockResolvedValue(mockFavorite);

      await expect(
        service.create('user-1', createFavoriteDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create('user-1', createFavoriteDto),
      ).rejects.toThrow('This spot is already in your favorites');
    });
  });

  describe('findAll', () => {
    it('should return all favorite spots for a user', async () => {
      const favoritesWithSpots = [
        {
          ...mockFavorite,
          spot: {
            ...mockSpot,
            createdBy: {
              id: 'user-2',
              name: 'Spot Owner',
              email: 'owner@example.com',
            },
          },
        },
      ];

      mockPrismaService.favorite.findMany.mockResolvedValue(
        favoritesWithSpots,
      );

      const result = await service.findAll('user-1');

      expect(result).toEqual(favoritesWithSpots);
      expect(prismaService.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          spot: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when user has no favorites', async () => {
      mockPrismaService.favorite.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-1');

      expect(result).toEqual([]);
      expect(prismaService.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          spot: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a favorite successfully', async () => {
      mockPrismaService.favorite.findUnique.mockResolvedValue(mockFavorite);
      mockPrismaService.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await service.remove('favorite-1', 'user-1');

      expect(result).toEqual({ message: 'Favorite removed successfully' });
      expect(prismaService.favorite.findUnique).toHaveBeenCalledWith({
        where: { id: 'favorite-1' },
      });
      expect(prismaService.favorite.delete).toHaveBeenCalledWith({
        where: { id: 'favorite-1' },
      });
    });

    it('should throw NotFoundException when favorite not found', async () => {
      mockPrismaService.favorite.findUnique.mockResolvedValue(null);

      await expect(service.remove('favorite-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('favorite-999', 'user-1')).rejects.toThrow(
        'Favorite with ID favorite-999 not found',
      );
    });

    it('should throw NotFoundException when user is not the owner', async () => {
      const otherUserFavorite = {
        ...mockFavorite,
        userId: 'other-user',
      };

      mockPrismaService.favorite.findUnique.mockResolvedValue(
        otherUserFavorite,
      );

      await expect(service.remove('favorite-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('favorite-1', 'user-1')).rejects.toThrow(
        'You can only delete your own favorites',
      );
    });
  });

  describe('isFavorite', () => {
    it('should return true when spot is in favorites', async () => {
      mockPrismaService.favorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await service.isFavorite('user-1', 'spot-1');

      expect(result).toBe(true);
      expect(prismaService.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_spotId: {
            userId: 'user-1',
            spotId: 'spot-1',
          },
        },
      });
    });

    it('should return false when spot is not in favorites', async () => {
      mockPrismaService.favorite.findUnique.mockResolvedValue(null);

      const result = await service.isFavorite('user-1', 'spot-1');

      expect(result).toBe(false);
      expect(prismaService.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_spotId: {
            userId: 'user-1',
            spotId: 'spot-1',
          },
        },
      });
    });
  });
});
