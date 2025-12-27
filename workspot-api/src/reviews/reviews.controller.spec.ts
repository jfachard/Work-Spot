import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;

  const mockReviewsService = {
    create: jest.fn(),
    findAllBySpot: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
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
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a review for a spot', async () => {
      const spotId = 'spot-1';
      const createReviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great place!',
        images: [],
      };

      mockReviewsService.create.mockResolvedValue(mockReview);

      const result = await controller.create(
        spotId,
        createReviewDto,
        mockRequest,
      );

      expect(result).toEqual(mockReview);
      expect(reviewsService.create).toHaveBeenCalledWith(
        spotId,
        'user-1',
        createReviewDto,
      );
      expect(reviewsService.create).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token', async () => {
      const spotId = 'spot-1';
      const createReviewDto: CreateReviewDto = {
        rating: 4,
        comment: 'Nice spot',
      };

      mockReviewsService.create.mockResolvedValue(mockReview);

      await controller.create(spotId, createReviewDto, mockRequest);

      expect(reviewsService.create).toHaveBeenCalledWith(
        spotId,
        mockRequest.user.sub,
        createReviewDto,
      );
    });
  });

  describe('findAllBySpot', () => {
    it('should return all reviews for a spot', async () => {
      const spotId = 'spot-1';
      const reviews = [mockReview];

      mockReviewsService.findAllBySpot.mockResolvedValue(reviews);

      const result = await controller.findAllBySpot(spotId);

      expect(result).toEqual(reviews);
      expect(reviewsService.findAllBySpot).toHaveBeenCalledWith(spotId);
      expect(reviewsService.findAllBySpot).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no reviews exist', async () => {
      const spotId = 'spot-1';

      mockReviewsService.findAllBySpot.mockResolvedValue([]);

      const result = await controller.findAllBySpot(spotId);

      expect(result).toEqual([]);
      expect(reviewsService.findAllBySpot).toHaveBeenCalledWith(spotId);
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const reviewId = 'review-1';
      const reviewWithSpot = {
        ...mockReview,
        spot: {
          id: 'spot-1',
          name: 'Test Café',
        },
      };

      mockReviewsService.findOne.mockResolvedValue(reviewWithSpot);

      const result = await controller.findOne(reviewId);

      expect(result).toEqual(reviewWithSpot);
      expect(reviewsService.findOne).toHaveBeenCalledWith(reviewId);
      expect(reviewsService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const reviewId = 'review-1';
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
        comment: 'Updated comment',
      };

      const updatedReview = {
        ...mockReview,
        ...updateReviewDto,
      };

      mockReviewsService.update.mockResolvedValue(updatedReview);

      const result = await controller.update(
        reviewId,
        updateReviewDto,
        mockRequest,
      );

      expect(result).toEqual(updatedReview);
      expect(reviewsService.update).toHaveBeenCalledWith(
        reviewId,
        'user-1',
        updateReviewDto,
      );
      expect(reviewsService.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates', async () => {
      const reviewId = 'review-1';
      const updateReviewDto: UpdateReviewDto = {
        comment: 'Only updating comment',
      };

      const updatedReview = {
        ...mockReview,
        comment: 'Only updating comment',
      };

      mockReviewsService.update.mockResolvedValue(updatedReview);

      const result = await controller.update(
        reviewId,
        updateReviewDto,
        mockRequest,
      );

      expect(result).toEqual(updatedReview);
      expect(reviewsService.update).toHaveBeenCalledWith(
        reviewId,
        'user-1',
        updateReviewDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a review', async () => {
      const reviewId = 'review-1';
      const deleteResponse = { message: 'Review deleted successfully' };

      mockReviewsService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(reviewId, mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(reviewsService.remove).toHaveBeenCalledWith(reviewId, 'user-1');
      expect(reviewsService.remove).toHaveBeenCalledTimes(1);
    });

    it('should extract user ID from JWT token for deletion', async () => {
      const reviewId = 'review-1';
      const deleteResponse = { message: 'Review deleted successfully' };

      mockReviewsService.remove.mockResolvedValue(deleteResponse);

      await controller.remove(reviewId, mockRequest);

      expect(reviewsService.remove).toHaveBeenCalledWith(
        reviewId,
        mockRequest.user.sub,
      );
    });
  });
});
