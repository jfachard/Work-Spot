import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'SecurePass123!',
    description: 'User password (minimum 8 characters)',
    minLength: 8
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: 'John Doe',
    description: 'User full name'
  })
  @IsNotEmpty()
  name: string;
}