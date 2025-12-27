import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFavoriteDto: CreateFavoriteDto) {
    const { spotId } = createFavoriteDto;

    const spot = await this.prisma.spot.findUnique({
      where: { id: spotId },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${spotId} not found`);
    }

    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_spotId: {
          userId,
          spotId,
        },
      },
    });

    if (existingFavorite) {
      throw new BadRequestException('This spot is already in your favorites');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        spotId,
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
  }

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
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
  }

  async remove(id: string, userId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) {
      throw new NotFoundException(`Favorite with ID ${id} not found`);
    }

    if (favorite.userId !== userId) {
      throw new NotFoundException('You can only delete your own favorites');
    }

    await this.prisma.favorite.delete({
      where: { id },
    });

    return { message: 'Favorite removed successfully' };
  }

  async isFavorite(userId: string, spotId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_spotId: {
          userId,
          spotId,
        },
      },
    });

    return !!favorite;
  }
}