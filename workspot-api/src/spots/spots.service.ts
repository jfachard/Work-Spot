import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';

@Injectable()
export class SpotsService {
  constructor(private prisma: PrismaService) {}

  async create(createSpotDto: CreateSpotDto, userId: string) {
    return this.prisma.spot.create({
      data: {
        ...createSpotDto,
        createdById: userId,
      },
    });
  }

  async findAll(filters?: {
    latitude?: number;
    longitude?: number;
    radius?: number; // en km
    hasWifi?: boolean;
    hasPower?: boolean;
    type?: string;
  }) {
    const where: any = {};

    if (filters?.hasWifi !== undefined) {
      where.hasWifi = filters.hasWifi;
    }

    if (filters?.hasPower !== undefined) {
      where.hasPower = filters.hasPower;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const spots = await this.prisma.spot.findMany({
      where,
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

    // Si géolocalisation, filtrer par distance
    if (filters?.latitude && filters?.longitude && filters?.radius) {
      return spots.filter(spot => {
        const distance = this.calculateDistance(
          filters.latitude!,
          filters.longitude!,
          spot.latitude,
          spot.longitude,
        );
        return distance <= filters.radius!;
      });
    }

    return spots;
  }

  async findOne(id: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id },
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

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${id} not found`);
    }

    return spot;
  }

  async update(id: string, updateSpotDto: UpdateSpotDto, userId: string) {
    // Vérifier que le spot existe et appartient à l'user
    const spot = await this.prisma.spot.findUnique({
      where: { id },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${id} not found`);
    }

    if (spot.createdById !== userId) {
      throw new NotFoundException('You can only update your own spots');
    }

    return this.prisma.spot.update({
      where: { id },
      data: updateSpotDto,
    });
  }

  async remove(id: string, userId: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${id} not found`);
    }

    if (spot.createdById !== userId) {
      throw new NotFoundException('You can only delete your own spots');
    }

    await this.prisma.spot.delete({
      where: { id },
    });

    return { message: 'Spot deleted successfully' };
  }

  // Calcul de distance entre deux points (formule Haversine)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}