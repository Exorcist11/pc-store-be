import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { PublicService } from './public.service';

import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Product } from '../products/schema/product.schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('product/:slug')
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo slug' })
  @ApiResponse({ status: 200, description: 'Tìm thấy sản phẩm', type: Product })
  async findProductBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.publicService.findProductBySlug(slug);
  }

  @Get('products')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (có phân trang & tìm kiếm)' })
  async findFeaturesProduct(@Query() query: PaginationQueryDto) {
    return this.publicService.findFeaturesProduct(query);
  }

  @Get('category')
  @ApiOperation({ summary: 'Lấy danh sách danh mục (có phân trang & tìm kiếm)' })
  async findCategory(@Query() query: PaginationQueryDto) {
    return this.publicService.findCategory(query);
  }

  @Get('productByCategory/:slug')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo slug danh mục' })
  @ApiParam({
    name: 'slug',
    description: 'Slug của danh mục sản phẩm',
    example: 'laptop-hp-15',
  })
  @ApiQuery({ name: 'index', required: false, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng sản phẩm mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'sort', required: false, example: 'name', description: 'Trường cần sắp xếp (vd: name, price)' })
  @ApiQuery({ name: 'order', required: false, example: 'asc', description: 'Thứ tự sắp xếp (asc hoặc desc)' })
  @ApiResponse({ status: 200, description: 'Tìm thấy sản phẩm', type: Product })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async findProductByCategorySlug(
    @Param('slug') slug: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.publicService.findProductByCategorySlug(slug, query);
  }
}
