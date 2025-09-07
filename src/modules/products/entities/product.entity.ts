import { ApiProperty } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty({ example: '64f92e8e8c9e2f0c12345678' })
  id: string;

  @ApiProperty({ example: 'Intel Core i9' })
  name: string;

  @ApiProperty({ example: 'intel-core-i9' })
  slug: string;

  @ApiProperty({ example: 'SKU123456' })
  sku: string;

  @ApiProperty({ example: '64f92e8e8c9e2f0c12345670' })
  categoryId: string;

  @ApiProperty({ example: '64f92e8e8c9e2f0c12345671' })
  brandId: string;

  @ApiProperty({ example: 'component', enum: ['component', 'laptop', 'prebuilt', 'accessory'] })
  productType: string;

  @ApiProperty({ example: 'Full description here', required: false })
  description?: string;

  @ApiProperty({ example: 'Short description', required: false })
  shortDescription?: string;

  @ApiProperty({ example: {}, required: false })
  specifications?: Record<string, any>;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  images?: string[];

  @ApiProperty({ example: 500 })
  price: number;

  @ApiProperty({ example: 550, required: false })
  comparePrice?: number;

  @ApiProperty({ example: 400, required: false })
  costPrice?: number;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: 5 })
  minStock: number;

  @ApiProperty({ example: 1.5, required: false })
  weight?: number;

  @ApiProperty({ example: { length: 10, width: 5, height: 2 }, required: false })
  dimensions?: { length: number; width: number; height: number };

  @ApiProperty({ 
    example: { sockets: ['LGA1200'], memoryTypes: ['DDR4'], maxMemory: 64 }, 
    required: false 
  })
  compatibility?: { sockets: string[]; memoryTypes: string[]; maxMemory: number };

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: ['gaming', 'high-end'], required: false })
  tags?: string[];

  @ApiProperty({ example: 'SEO title', required: false })
  seoTitle?: string;

  @ApiProperty({ example: 'SEO description', required: false })
  seoDescription?: string;

  @ApiProperty({ example: '2025-09-07T10:15:30.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-07T10:15:30.000Z' })
  updatedAt: Date;
}
