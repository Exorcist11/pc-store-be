import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Category } from './schema/category.schema';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: Category,
  })
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'parentId', required: false })
  @ApiQuery({ name: 'index', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sort', required: false, example: 'name' })
  @ApiQuery({ name: 'order', required: false, example: 'asc' })
  async findAll(@Query() query: PaginationQueryDto) {
    // Bạn có thể triển khai filtering, sorting và pagination ở service
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: Category })
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated', type: Category })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({ status: 200, description: 'Category deleted', type: Category })
  async remove(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.remove(id);
  }
}
