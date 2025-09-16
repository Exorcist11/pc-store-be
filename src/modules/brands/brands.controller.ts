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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Brand } from './schema/brand.schema';

@ApiTags('Brand')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thương hiệu mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo thương hiệu thành công',
    type: Brand,
  })
  async create(@Body() dto: CreateBrandDto): Promise<Brand> {
    return this.brandsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thương hiệu' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'index', required: false, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng thương hiệu mỗi trang (mặc định = 10)' })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'createdAt',
    description: 'Trường cần sắp xếp (vd: name, createdAt)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
    description: 'Thứ tự sắp xếp (asc hoặc desc)',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thương hiệu theo ID' })
  @ApiResponse({ status: 200, description: 'Tìm thấy thương hiệu', type: Brand })
  async findOne(@Param('id') id: string): Promise<Brand> {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thương hiệu theo ID' })
  @ApiResponse({ status: 200, description: 'Cập nhật thương hiệu thành công', type: Brand })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ): Promise<Brand> {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thương hiệu theo ID' })
  @ApiResponse({ status: 200, description: 'Xóa thương hiệu thành công', type: Brand })
  async remove(@Param('id') id: string): Promise<Brand> {
    return this.brandsService.remove(id);
  }
}
