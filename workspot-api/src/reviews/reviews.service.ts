import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(spotId: string, userId: string, createReviewDto: CreateReviewDto) {
    const spot = await this.prisma.spot.findUnique({
      where: { id: spotId },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${spotId} not found`);
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_spotId: {
          userId,
          spotId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this spot');
    }

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        spotId,
        userId,
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

    await this.updateSpotRating(spotId);

    return review;
  }

  async findAllBySpot(spotId: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id: spotId },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${spotId} not found`);
    }

    return this.prisma.review.findMany({
      where: { spotId },
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
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (Object.keys(updateReviewDto).length === 0) {
      throw new BadRequestException('No data provided for update');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
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

    if (updateReviewDto.rating !== undefined) {
      await this.updateSpotRating(review.spotId);
    }

    return updatedReview;
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const spotId = review.spotId;

    await this.prisma.review.delete({
      where: { id },
    });

    await this.updateSpotRating(spotId);

    return { message: 'Review deleted successfully' };
  }

  private async updateSpotRating(spotId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { spotId },
      select: { rating: true },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    await this.prisma.spot.update({
      where: { id: spotId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      },
    });
  }
}