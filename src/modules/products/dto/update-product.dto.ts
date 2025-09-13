import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsEnum,
} from 'class-validator';

class UpdateVariantDto {
  @ApiProperty({ description: 'SKU of the variant', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ description: 'Price of the variant', required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Stock quantity of the variant', required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'Attributes of the variant', required: false })
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiProperty({ description: 'Images of the variant', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Name of the product', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Brand ID', required: false })
  @IsMongoId()
  @IsOptional()
  brand?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsMongoId()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Type of product',
    enum: ['laptop', 'desktop', 'accessory'],
    required: false,
  })
  @IsEnum(['laptop', 'desktop', 'accessory'])
  @IsOptional()
  productType?: string;

  @ApiProperty({
    description: 'Allowed attributes for variants',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedAttributes?: string[];

  @ApiProperty({ description: 'Product variants', type: [UpdateVariantDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantDto)
  @IsOptional()
  variants?: UpdateVariantDto[];

  @ApiProperty({ description: 'Product images', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'Discount percentage', required: false })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: true, default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
