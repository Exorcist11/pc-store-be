import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Category for electronic products', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '64f92e8e8c9e2f0c12345670', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
