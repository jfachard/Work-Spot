import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';

export enum NoiseLevel {
  QUIET = 'QUIET',
  MODERATE = 'MODERATE',
  LOUD = 'LOUD',
}

export enum PriceRange {
  FREE = 'FREE',
  CHEAP = 'CHEAP',
  MODERATE = 'MODERATE',
  EXPENSIVE = 'EXPENSIVE',
}

export enum SpotType {
  CAFE = 'CAFE',
  LIBRARY = 'LIBRARY',
  COWORKING = 'COWORKING',
  PARK = 'PARK',
  OTHER = 'OTHER',
}

export class CreateSpotDto {
  @ApiProperty({ example: 'Le Coffee Lab' })
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

  @ApiProperty({ example: 'France' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 48.8566 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 2.3522 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  hasWifi: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  hasPower: boolean;

  @ApiProperty({ enum: NoiseLevel, example: NoiseLevel.MODERATE })
  @IsEnum(NoiseLevel)
  noiseLevel: NoiseLevel;

  @ApiProperty({ enum: PriceRange, example: PriceRange.MODERATE })
  @IsEnum(PriceRange)
  priceRange: PriceRange;

  @ApiProperty({ enum: SpotType, example: SpotType.CAFE })
  @IsEnum(SpotType)
  type: SpotType;

  @ApiProperty({ example: '8:00 - 20:00', required: false })
  @IsString()
  @IsOptional()
  openingHours?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/...',
    required: false,
    description: 'URL de la photo de couverture',
  })
  @IsUrl()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({
    example: ['https://res.cloudinary.com/...'],
    required: false,
    type: [String],
    description: 'URLs des photos additionnelles',
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 'https://open.spotify.com/...', required: false })
  @IsUrl()
  @IsOptional()
  playlistUrl?: string;
}
