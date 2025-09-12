import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Tên của danh mục',
    example: 'Điện tử',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

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

  @ApiProperty({
    description: 'Cấp độ của danh mục (1, 2 hoặc 3)',
    example: 1,
    enum: [1, 2, 3],
    required: false,
  })
  @IsEnum([1, 2, 3])
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động (optional)' })
  isActive?: boolean;
}
