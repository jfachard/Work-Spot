import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ 
    example: '01a0e635-3b60-4a6c-a2f8-2013e995dfdf',
    description: 'Spot ID to add to favorites'
  })
  @IsUUID()
  @IsNotEmpty()
  spotId: string;
}