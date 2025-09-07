import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ description: 'Optional new name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Optional new slug' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Optional new SKU' })
  sku?: string;

  @ApiPropertyOptional({ description: 'Optional category ID' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Optional brand ID' })
  brandId?: string;

  @ApiPropertyOptional({ description: 'Optional product type' })
  productType?: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Optional short description' })
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Optional specifications object' })
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Optional images array' })
  images?: string[];

  @ApiPropertyOptional({ description: 'Optional price' })
  price?: number;

  @ApiPropertyOptional({ description: 'Optional comparePrice' })
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Optional costPrice' })
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Optional stock' })
  stock?: number;

  @ApiPropertyOptional({ description: 'Optional minStock' })
  minStock?: number;

  @ApiPropertyOptional({ description: 'Optional weight' })
  weight?: number;

  @ApiPropertyOptional({ description: 'Optional dimensions' })
  dimensions?: { length: number; width: number; height: number };

  @ApiPropertyOptional({ description: 'Optional compatibility' })
  compatibility?: {
    sockets: string[];
    memoryTypes: string[];
    maxMemory: number;
  };

  @ApiPropertyOptional({ description: 'Optional isActive flag' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Optional isFeatured flag' })
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Optional tags array' })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Optional SEO title' })
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'Optional SEO description' })
  seoDescription?: string;
}
