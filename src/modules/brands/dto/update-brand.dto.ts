import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @ApiPropertyOptional({ description: 'Tên thương hiệu (optional)' })
  name?: string;

  @ApiPropertyOptional({ description: 'Slug thương hiệu (optional)' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn logo (optional)' })
  logo?: string;

  @ApiPropertyOptional({ description: 'Mô tả thương hiệu (optional)' })
  description?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động (optional)' })
  isActive?: boolean;
}
