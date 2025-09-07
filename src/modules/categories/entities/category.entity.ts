import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: '64f92e8e8c9e2f0c12345678' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;

  @ApiProperty({ example: 'Category for electronic products', required: false })
  description?: string;

  @ApiProperty({ example: '64f92e8e8c9e2f0c12345670', required: false })
  parentId?: string;

  @ApiProperty({ example: 0 })
  level: number;

  @ApiProperty({ example: true, default: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ example: '2025-09-07T10:15:30.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-07T10:15:30.000Z' })
  updatedAt: Date;
}
