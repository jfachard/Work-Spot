import { Test, TestingModule } from '@nestjs/testing';
import { SpotsService } from './spots.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSpotDto, NoiseLevel, PriceRange, SpotType } from './dto/create-spot.dto';

describe('SpotsService', () => {
  let service: SpotsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    spot: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSpot = {
    id: '1',
    name: 'Test Café',
    description: 'A nice café',
    address: '123 Test St',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    hasWifi: true,
    hasPower: true,
    noiseLevel: NoiseLevel.MODERATE,
    priceRange: PriceRange.MODERATE,
    type: SpotType.CAFE,
    coverImage: null,
    images: [],
    playlistUrl: null,
    averageRating: 0,
    reviewCount: 0,
    verified: false,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SpotsService>(SpotsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new spot successfully', async () => {
      const createSpotDto: CreateSpotDto = {
        name: 'Test Café',
        description: 'A nice café',
        address: '123 Test St',
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        hasWifi: true,
        hasPower: true,
        noiseLevel: NoiseLevel.MODERATE,
        priceRange: PriceRange.MODERATE,
        type: SpotType.CAFE,
      };

      mockPrismaService.spot.create.mockResolvedValue(mockSpot);

      const result = await service.create(createSpotDto, 'user-1');

      expect(result).toEqual(mockSpot);
      expect(prismaService.spot.create).toHaveBeenCalledWith({
        data: {
          ...createSpotDto,
          createdById: 'user-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all spots without filters', async () => {
      const spotsWithUser = [
        {
          ...mockSpot,
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      mockPrismaService.spot.findMany.mockResolvedValue(spotsWithUser);

      const result = await service.findAll();

      expect(result).toEqual(spotsWithUser);
      expect(prismaService.spot.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should filter spots by hasWifi', async () => {
      const spotsWithUser = [
        {
          ...mockSpot,
          hasWifi: true,
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      mockPrismaService.spot.findMany.mockResolvedValue(spotsWithUser);

      const result = await service.findAll({ hasWifi: true });

      expect(result).toEqual(spotsWithUser);
      expect(prismaService.spot.findMany).toHaveBeenCalledWith({
        where: { hasWifi: true },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should filter spots by type', async () => {
      const spotsWithUser = [
        {
          ...mockSpot,
          type: SpotType.CAFE,
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      mockPrismaService.spot.findMany.mockResolvedValue(spotsWithUser);

      const result = await service.findAll({ type: SpotType.CAFE });

      expect(result).toEqual(spotsWithUser);
      expect(prismaService.spot.findMany).toHaveBeenCalledWith({
        where: { type: SpotType.CAFE },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should filter spots by geolocation and radius', async () => {
      const spot1 = {
        ...mockSpot,
        id: '1',
        latitude: 48.8566,
        longitude: 2.3522,
        createdBy: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      const spot2 = {
        ...mockSpot,
        id: '2',
        latitude: 45.764,
        longitude: 4.8357,
        createdBy: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockPrismaService.spot.findMany.mockResolvedValue([spot1, spot2]);

      const result = await service.findAll({
        latitude: 48.8566,
        longitude: 2.3522,
        radius: 10,
      });

      // Seul le spot1 devrait être retourné car il est dans le rayon
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('findOne', () => {
    it('should return a spot by id', async () => {
      const spotWithRelations = {
        ...mockSpot,
        createdBy: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        reviews: [],
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(spotWithRelations);

      const result = await service.findOne('1');

      expect(result).toEqual(spotWithRelations);
      expect(prismaService.spot.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when spot not found', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('Spot with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update a spot successfully', async () => {
      const updateDto = {
        name: 'Updated Café',
        hasWifi: false,
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.spot.update.mockResolvedValue({
        ...mockSpot,
        ...updateDto,
      });

      const result = await service.update('1', updateDto, 'user-1');

      expect(result.name).toBe('Updated Café');
      expect(prismaService.spot.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when spot not found', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue(null);

      await expect(service.update('999', {}, 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.update('999', {}, 'user-1')).rejects.toThrow(
        'Spot with ID 999 not found',
      );
    });

    it('should throw NotFoundException when user is not the owner', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue({
        ...mockSpot,
        createdById: 'other-user',
      });

      await expect(service.update('1', {}, 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.update('1', {}, 'user-1')).rejects.toThrow(
        'You can only update your own spots',
      );
    });
  });

  describe('remove', () => {
    it('should delete a spot successfully', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.spot.delete.mockResolvedValue(mockSpot);

      const result = await service.remove('1', 'user-1');

      expect(result).toEqual({ message: 'Spot deleted successfully' });
      expect(prismaService.spot.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when spot not found', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue(null);

      await expect(service.remove('999', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.remove('999', 'user-1')).rejects.toThrow(
        'Spot with ID 999 not found',
      );
    });

    it('should throw NotFoundException when user is not the owner', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue({
        ...mockSpot,
        createdById: 'other-user',
      });

      await expect(service.remove('1', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.remove('1', 'user-1')).rejects.toThrow(
        'You can only delete your own spots',
      );
    });
  });
});
