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
class VariantDto {
  @ApiProperty({ description: 'SKU of the variant' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Price of the variant' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Stock quantity of the variant' })
  @IsNumber()
  stock: number;

  @ApiProperty({ description: 'Attributes of the variant' })
  @IsNotEmpty()
  attributes: Record<string, string>;

  @ApiProperty({ description: 'Images of the variant', type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the product' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Brand ID' })
  @IsMongoId()
  brand: string;

  @ApiProperty({ description: 'Category ID' })
  @IsMongoId()
  category: string;

  @ApiProperty({
    description: 'Type of product',
    enum: ['laptop', 'desktop', 'accessory'],
  })
  @IsEnum(['laptop', 'desktop', 'accessory'])
  productType: string;

  @ApiProperty({
    description: 'Allowed attributes for variants',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedAttributes?: string[];

  @ApiProperty({ description: 'Product variants', type: [VariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];

  @ApiProperty({ description: 'Product images', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'Discount percentage' })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: true, default: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
