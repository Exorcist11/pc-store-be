import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Tên của danh mục', example: 'Điện tử' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mô tả của danh mục',
    example: 'Danh mục các sản phẩm điện tử',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID của danh mục cha',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  parent?: Types.ObjectId;
}
