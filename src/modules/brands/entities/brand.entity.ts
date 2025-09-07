import { ApiProperty } from '@nestjs/swagger';

export class BrandEntity {
  @ApiProperty({ example: '64f92e8e8c9e2f0c12345678' })
  id: string;

  @ApiProperty({ example: 'ROG' })
  name: string;

  @ApiProperty({ example: 'rog' })
  slug: string;

  @ApiProperty({
    example: 'https://example.com/uploads/rog-logo.png',
    required: false,
  })
  logo?: string;

  @ApiProperty({
    required: false,
  })
  description?: string;

  @ApiProperty({ example: true, default: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-09-07T10:15:30.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-07T10:15:30.000Z' })
  updatedAt: Date;
}
