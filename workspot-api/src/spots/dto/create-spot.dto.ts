import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export enum NoiseLevel {
  QUIET = 'QUIET',
  MODERATE = 'MODERATE',
  LOUD = 'LOUD'
}

export enum PriceRange {
  FREE = 'FREE',
  CHEAP = 'CHEAP',
  MODERATE = 'MODERATE',
  EXPENSIVE = 'EXPENSIVE'
}

export enum SpotType {
  CAFE = 'CAFE',
  LIBRARY = 'LIBRARY',
  COWORKING = 'COWORKING',
  PARK = 'PARK',
  OTHER = 'OTHER'
}

export class CreateSpotDto {
  @ApiProperty({ example: 'Le Café des Arts' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A quiet café perfect for working', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '12 Rue de la Paix' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'France', default: 'France' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 48.8566 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 2.3522 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  hasWifi?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  hasPower?: boolean;

  @ApiProperty({ enum: NoiseLevel, example: NoiseLevel.MODERATE })
  @IsEnum(NoiseLevel)
  @IsOptional()
  noiseLevel?: NoiseLevel;

  @ApiProperty({ enum: PriceRange, example: PriceRange.MODERATE })
  @IsEnum(PriceRange)
  @IsOptional()
  priceRange?: PriceRange;

  @ApiProperty({ enum: SpotType, example: SpotType.CAFE })
  @IsEnum(SpotType)
  @IsOptional()
  type?: SpotType;
}