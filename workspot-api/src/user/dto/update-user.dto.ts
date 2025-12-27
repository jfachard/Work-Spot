import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ 
    example: 'John Doe',
    description: 'User full name',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User email address',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}