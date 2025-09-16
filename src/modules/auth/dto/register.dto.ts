import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Tên người dùng', example: 'johndoe' })
  @IsNotEmpty({ message: 'Tên người dùng là bắt buộc' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Địa chỉ email', example: 'john@example.com' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'password123' })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  password: string;

  @ApiProperty({ description: 'Họ và tên', example: 'John Doe' })
  @IsNotEmpty({ message: 'Họ và tên là bắt buộc' })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: ['customer', 'admin', 'staff'],
    default: 'customer',
  })
  @IsEnum(['customer', 'admin', 'staff'], { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: string;
}
