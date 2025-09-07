import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Intel Core i9' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'intel-core-i9' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'SKU123456' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: '64f92e8e8c9e2f0c12345670' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: '64f92e8e8c9e2f0c12345671' })
  @IsString()
  brandId: string;

  @ApiProperty({
    example: 'component',
    enum: ['component', 'laptop', 'prebuilt', 'accessory'],
  })
  @IsString()
  productType: string;

  @ApiProperty({ example: 'Full description here', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Short description', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ example: 500 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 550, required: false })
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiProperty({ example: 400, required: false })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  stock: number;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  minStock?: number;

  @ApiProperty({ example: 1.5, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({
    example: { length: 10, width: 5, height: 2 },
    required: false,
  })
  @IsOptional()
  dimensions?: { length: number; width: number; height: number };

  @ApiProperty({
    example: { sockets: ['LGA1200'], memoryTypes: ['DDR4'], maxMemory: 64 },
    required: false,
  })
  @IsOptional()
  compatibility?: {
    sockets: string[];
    memoryTypes: string[];
    maxMemory: number;
  };

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: ['gaming', 'high-end'], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ example: 'SEO title', required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ example: 'SEO description', required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;
}
