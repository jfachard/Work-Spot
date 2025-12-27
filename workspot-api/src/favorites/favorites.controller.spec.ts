import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let favoritesService: FavoritesService;

  const mockFavoritesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  const mockFavorite = {
    id: 'favorite-1',
    userId: 'user-1',
    spotId: 'spot-1',
    createdAt: new Date(),
    spot: {
      id: 'spot-1',
      name: 'Test Café',
      description: 'A nice café',
      address: '123 Test St',
      city: 'Paris',
      createdBy: {
        id: 'user-2',
        name: 'Spot Owner',
        email: 'owner@example.com',
      },
    },
  };

  const mockRequest = {
    user: {
      sub: 'user-1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: mockFavoritesService,
        },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    favoritesService = module.get<FavoritesService>(FavoritesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should add a spot to favorites', async () => {
      const createFavoriteDto: CreateFavoriteDto = {
        spotId: 'spot-1',
      };

      mockFavoritesService.create.mockResolvedValue(mockFavorite);

      const result = await controller.create(createFavoriteDto, mockRequest);

      expect(result).toEqual(mockFavorite);
      expect(favoritesService.create).toHaveBeenCalledWith(
        'user-1',
        createFavoriteDto,
      );
      expect(favoritesService.create).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token', async () => {
      const createFavoriteDto: CreateFavoriteDto = {
        spotId: 'spot-1',
      };

      mockFavoritesService.create.mockResolvedValue(mockFavorite);

      await controller.create(createFavoriteDto, mockRequest);

      expect(favoritesService.create).toHaveBeenCalledWith(
        mockRequest.user.sub,
        createFavoriteDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all favorite spots for the user', async () => {
      const favorites = [mockFavorite];

      mockFavoritesService.findAll.mockResolvedValue(favorites);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(favorites);
      expect(favoritesService.findAll).toHaveBeenCalledWith('user-1');
      expect(favoritesService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no favorites', async () => {
      mockFavoritesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
      expect(favoritesService.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('remove', () => {
    it('should remove a spot from favorites', async () => {
      const favoriteId = 'favorite-1';
      const deleteResponse = { message: 'Favorite removed successfully' };

      mockFavoritesService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(favoriteId, mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(favoritesService.remove).toHaveBeenCalledWith(
        favoriteId,
        'user-1',
      );
      expect(favoritesService.remove).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token for deletion', async () => {
      const favoriteId = 'favorite-1';
      const deleteResponse = { message: 'Favorite removed successfully' };

      mockFavoritesService.remove.mockResolvedValue(deleteResponse);

      await controller.remove(favoriteId, mockRequest);

      expect(favoritesService.remove).toHaveBeenCalledWith(
        favoriteId,
        mockRequest.user.sub,
      );
    });
  });
});
