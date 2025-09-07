import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Unique username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 chars)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'customer',
    enum: ['customer', 'admin', 'staff'],
    default: 'customer',
  })
  @IsOptional()
  role?: string;
}
