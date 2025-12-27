import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    spot: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSpot = {
    id: 'spot-1',
    name: 'Test Café',
    averageRating: 0,
    reviewCount: 0,
  };

  const mockReview = {
    id: 'review-1',
    rating: 5,
    comment: 'Great place!',
    images: [],
    spotId: 'spot-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a review successfully', async () => {
      const createReviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great place!',
        images: [],
      };

      const reviewWithUser = {
        ...mockReview,
        user: mockUser,
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue(reviewWithUser);
      mockPrismaService.review.findMany.mockResolvedValue([mockReview]);
      mockPrismaService.spot.update.mockResolvedValue(mockSpot);

      const result = await service.create(
        'spot-1',
        'user-1',
        createReviewDto,
      );

      expect(result).toEqual(reviewWithUser);
      expect(prismaService.spot.findUnique).toHaveBeenCalledWith({
        where: { id: 'spot-1' },
      });
      expect(prismaService.review.findUnique).toHaveBeenCalledWith({
        where: {
          userId_spotId: {
            userId: 'user-1',
            spotId: 'spot-1',
          },
        },
      });
      expect(prismaService.review.create).toHaveBeenCalledWith({
        data: {
          ...createReviewDto,
          spotId: 'spot-1',
          userId: 'user-1',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when spot does not exist', async () => {
      const createReviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great place!',
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(null);

      await expect(
        service.create('spot-999', 'user-1', createReviewDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create('spot-999', 'user-1', createReviewDto),
      ).rejects.toThrow('Spot with ID spot-999 not found');
    });

    it('should throw BadRequestException when user already reviewed the spot', async () => {
      const createReviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great place!',
      };

      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.create('spot-1', 'user-1', createReviewDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create('spot-1', 'user-1', createReviewDto),
      ).rejects.toThrow('You have already reviewed this spot');
    });
  });

  describe('findAllBySpot', () => {
    it('should return all reviews for a spot', async () => {
      const reviewsWithUser = [
        {
          ...mockReview,
          user: mockUser,
        },
      ];

      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.review.findMany.mockResolvedValue(reviewsWithUser);

      const result = await service.findAllBySpot('spot-1');

      expect(result).toEqual(reviewsWithUser);
      expect(prismaService.spot.findUnique).toHaveBeenCalledWith({
        where: { id: 'spot-1' },
      });
      expect(prismaService.review.findMany).toHaveBeenCalledWith({
        where: { spotId: 'spot-1' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw NotFoundException when spot does not exist', async () => {
      mockPrismaService.spot.findUnique.mockResolvedValue(null);

      await expect(service.findAllBySpot('spot-999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findAllBySpot('spot-999')).rejects.toThrow(
        'Spot with ID spot-999 not found',
      );
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const reviewWithRelations = {
        ...mockReview,
        user: mockUser,
        spot: {
          id: 'spot-1',
          name: 'Test Café',
        },
      };

      mockPrismaService.review.findUnique.mockResolvedValue(
        reviewWithRelations,
      );

      const result = await service.findOne('review-1');

      expect(result).toEqual(reviewWithRelations);
      expect(prismaService.review.findUnique).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          spot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when review not found', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.findOne('review-999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('review-999')).rejects.toThrow(
        'Review with ID review-999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a review successfully', async () => {
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
        comment: 'Updated comment',
      };

      const updatedReview = {
        ...mockReview,
        ...updateReviewDto,
        user: mockUser,
      };

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.update.mockResolvedValue(updatedReview);
      mockPrismaService.review.findMany.mockResolvedValue([mockReview]);
      mockPrismaService.spot.update.mockResolvedValue(mockSpot);

      const result = await service.update(
        'review-1',
        'user-1',
        updateReviewDto,
      );

      expect(result).toEqual(updatedReview);
      expect(prismaService.review.update).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        data: updateReviewDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when review not found', async () => {
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
      };

      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update('review-999', 'user-1', updateReviewDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('review-999', 'user-1', updateReviewDto),
      ).rejects.toThrow('Review with ID review-999 not found');
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
      };

      const otherUserReview = {
        ...mockReview,
        userId: 'other-user',
      };

      mockPrismaService.review.findUnique.mockResolvedValue(otherUserReview);

      await expect(
        service.update('review-1', 'user-1', updateReviewDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update('review-1', 'user-1', updateReviewDto),
      ).rejects.toThrow('You can only update your own reviews');
    });

    it('should throw BadRequestException when no data provided', async () => {
      const updateReviewDto: UpdateReviewDto = {};

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.update('review-1', 'user-1', updateReviewDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('review-1', 'user-1', updateReviewDto),
      ).rejects.toThrow('No data provided for update');
    });

    it('should update spot rating when rating is changed', async () => {
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
      };

      const updatedReview = {
        ...mockReview,
        ...updateReviewDto,
        user: mockUser,
      };

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.update.mockResolvedValue(updatedReview);
      mockPrismaService.review.findMany.mockResolvedValue([
        { rating: 4 },
        { rating: 5 },
      ]);
      mockPrismaService.spot.update.mockResolvedValue({
        ...mockSpot,
        averageRating: 4.5,
        reviewCount: 2,
      });

      await service.update('review-1', 'user-1', updateReviewDto);

      expect(prismaService.spot.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a review successfully', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.delete.mockResolvedValue(mockReview);
      mockPrismaService.review.findMany.mockResolvedValue([]);
      mockPrismaService.spot.update.mockResolvedValue(mockSpot);

      const result = await service.remove('review-1', 'user-1');

      expect(result).toEqual({ message: 'Review deleted successfully' });
      expect(prismaService.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-1' },
      });
    });

    it('should throw NotFoundException when review not found', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.remove('review-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('review-999', 'user-1')).rejects.toThrow(
        'Review with ID review-999 not found',
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const otherUserReview = {
        ...mockReview,
        userId: 'other-user',
      };

      mockPrismaService.review.findUnique.mockResolvedValue(otherUserReview);

      await expect(service.remove('review-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.remove('review-1', 'user-1')).rejects.toThrow(
        'You can only delete your own reviews',
      );
    });

    it('should update spot rating after deletion', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.delete.mockResolvedValue(mockReview);
      mockPrismaService.review.findMany.mockResolvedValue([{ rating: 5 }]);
      mockPrismaService.spot.update.mockResolvedValue({
        ...mockSpot,
        averageRating: 5,
        reviewCount: 1,
      });

      await service.remove('review-1', 'user-1');

      expect(prismaService.spot.update).toHaveBeenCalledWith({
        where: { id: 'spot-1' },
        data: {
          averageRating: 5,
          reviewCount: 1,
        },
      });
    });
  });

  describe('updateSpotRating (private method)', () => {
    it('should calculate average rating correctly', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
      ]);
      mockPrismaService.spot.update.mockResolvedValue(mockSpot);

      // Test via create since updateSpotRating is private
      mockPrismaService.spot.findUnique.mockResolvedValue(mockSpot);
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue({
        ...mockReview,
        user: mockUser,
      });

      await service.create('spot-1', 'user-1', {
        rating: 5,
        comment: 'Test',
      });

      expect(prismaService.spot.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'spot-1' },
          data: expect.objectContaining({
            averageRating: expect.any(Number),
            reviewCount: expect.any(Number),
          }),
        }),
      );
    });

    it('should set rating to 0 when no reviews exist', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.delete.mockResolvedValue(mockReview);
      mockPrismaService.review.findMany.mockResolvedValue([]);
      mockPrismaService.spot.update.mockResolvedValue({
        ...mockSpot,
        averageRating: 0,
        reviewCount: 0,
      });

      await service.remove('review-1', 'user-1');

      expect(prismaService.spot.update).toHaveBeenCalledWith({
        where: { id: 'spot-1' },
        data: {
          averageRating: 0,
          reviewCount: 0,
        },
      });
    });
  });
});
