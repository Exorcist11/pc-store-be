import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({ description: 'Optional new category name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Optional new slug' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Optional new description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Optional new parent category ID' })
  parentId?: string;

  @ApiPropertyOptional({ description: 'Optional new level' })
  level?: number;

  @ApiPropertyOptional({ description: 'Optional new active status' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Optional new sort order' })
  sortOrder?: number;
}
