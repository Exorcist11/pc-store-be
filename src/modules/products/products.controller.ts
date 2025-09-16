import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Product } from './schema/product.schema';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công', type: Product })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Lọc theo danh mục' })
  @ApiQuery({ name: 'brandId', required: false, description: 'Lọc theo thương hiệu' })
  @ApiQuery({ name: 'index', required: false, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng sản phẩm mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'sort', required: false, example: 'name', description: 'Trường cần sắp xếp (vd: name, price)' })
  @ApiQuery({ name: 'order', required: false, example: 'asc', description: 'Thứ tự sắp xếp (asc hoặc desc)' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo ID' })
  @ApiResponse({ status: 200, description: 'Tìm thấy sản phẩm', type: Product })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật sản phẩm theo ID' })
  @ApiResponse({ status: 200, description: 'Cập nhật sản phẩm thành công', type: Product })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm theo ID' })
  @ApiResponse({ status: 200, description: 'Xóa sản phẩm thành công', type: Product })
  async remove(@Param('id') id: string): Promise<Product> {
    return this.productsService.remove(id);
  }
}
