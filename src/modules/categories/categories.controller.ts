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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Category } from './schema/category.schema';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}
  @Post()
  @ApiOperation({ summary: 'Tạo một danh mục mới' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Danh mục được tạo thành công.',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Danh mục cha không tồn tại.' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả danh mục với phân trang và tìm kiếm',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Từ khóa tìm kiếm theo tên hoặc slug',
    example: 'Điện tử',
  })
  @ApiQuery({
    name: 'index',
    required: true,
    description: 'Trang hiện tại',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Trường để sắp xếp',
    example: 'name',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách danh mục với phân trang.',
  })
  findAll(@Query() query: PaginationQueryDto): Promise<any> {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một danh mục theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID của danh mục',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin danh mục.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục.' })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin danh mục' })
  @ApiParam({
    name: 'id',
    description: 'ID của danh mục',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Danh mục được cập nhật thành công.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục.' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ.' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một danh mục theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID của danh mục',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Danh mục đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}
