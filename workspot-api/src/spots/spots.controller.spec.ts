import { Test, TestingModule } from '@nestjs/testing';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { CreateSpotDto, NoiseLevel, PriceRange, SpotType } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';

describe('SpotsController', () => {
  let controller: SpotsController;
  let spotsService: SpotsService;

  const mockSpotsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  const mockRequest = {
    user: {
      sub: 'user-1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotsController],
      providers: [
        {
          provide: SpotsService,
          useValue: mockSpotsService,
        },
      ],
    }).compile();

    controller = module.get<SpotsController>(SpotsController);
    spotsService = module.get<SpotsService>(SpotsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new spot', async () => {
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

      mockSpotsService.create.mockResolvedValue(mockSpot);

      const result = await controller.create(createSpotDto, mockRequest);

      expect(result).toEqual(mockSpot);
      expect(spotsService.create).toHaveBeenCalledWith(createSpotDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return all spots without filters', async () => {
      const spots = [mockSpot];
      mockSpotsService.findAll.mockResolvedValue(spots);

      const result = await controller.findAll();

      expect(result).toEqual(spots);
      expect(spotsService.findAll).toHaveBeenCalledWith({
        latitude: undefined,
        longitude: undefined,
        radius: undefined,
        hasWifi: undefined,
        hasPower: undefined,
        type: undefined,
      });
    });

    it('should return spots with geolocation filters', async () => {
      const spots = [mockSpot];
      mockSpotsService.findAll.mockResolvedValue(spots);

      const result = await controller.findAll('48.8566', '2.3522', '10');

      expect(result).toEqual(spots);
      expect(spotsService.findAll).toHaveBeenCalledWith({
        latitude: 48.8566,
        longitude: 2.3522,
        radius: 10,
        hasWifi: undefined,
        hasPower: undefined,
        type: undefined,
      });
    });

    it('should return spots with boolean filters', async () => {
      const spots = [mockSpot];
      mockSpotsService.findAll.mockResolvedValue(spots);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        'true',
        'false',
      );

      expect(result).toEqual(spots);
      expect(spotsService.findAll).toHaveBeenCalledWith({
        latitude: undefined,
        longitude: undefined,
        radius: undefined,
        hasWifi: true,
        hasPower: false,
        type: undefined,
      });
    });

    it('should return spots with type filter', async () => {
      const spots = [mockSpot];
      mockSpotsService.findAll.mockResolvedValue(spots);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        SpotType.CAFE,
      );

      expect(result).toEqual(spots);
      expect(spotsService.findAll).toHaveBeenCalledWith({
        latitude: undefined,
        longitude: undefined,
        radius: undefined,
        hasWifi: undefined,
        hasPower: undefined,
        type: SpotType.CAFE,
      });
    });
  });

  describe('findOne', () => {
    it('should return a spot by id', async () => {
      mockSpotsService.findOne.mockResolvedValue(mockSpot);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockSpot);
      expect(spotsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a spot', async () => {
      const updateDto: UpdateSpotDto = {
        name: 'Updated Café',
        hasWifi: false,
      };

      const updatedSpot = {
        ...mockSpot,
        ...updateDto,
      };

      mockSpotsService.update.mockResolvedValue(updatedSpot);

      const result = await controller.update('1', updateDto, mockRequest);

      expect(result).toEqual(updatedSpot);
      expect(spotsService.update).toHaveBeenCalledWith('1', updateDto, 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a spot', async () => {
      const deleteResponse = { message: 'Spot deleted successfully' };
      mockSpotsService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('1', mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(spotsService.remove).toHaveBeenCalledWith('1', 'user-1');
    });
  });
});
