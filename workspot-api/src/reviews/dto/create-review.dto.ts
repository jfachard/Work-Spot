import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ 
    example: 5,
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ 
    example: 'Great place to work! Fast wifi and friendly staff.',
    required: false
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ 
    example: ['https://example.com/photo1.jpg'],
    description: 'Array of image URLs',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}