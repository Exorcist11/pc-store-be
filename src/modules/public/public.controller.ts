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
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  async findProductBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.publicService.findProductBySlug(slug);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products with pagination & search' })
  async findFeaturesProduct(@Query() query: PaginationQueryDto) {
    return this.publicService.findFeaturesProduct(query);
  }

  @Get('category')
  @ApiOperation({ summary: 'Get products with pagination & search' })
  async findCategory(@Query() query: PaginationQueryDto) {
    return this.publicService.findCategory(query);
  }

  @Get('productByCategory/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    example: 'laptop-hp-15',
  })
  @ApiQuery({ name: 'index', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sort', required: false, example: 'name' })
  @ApiQuery({ name: 'order', required: false, example: 'asc' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findProductByCategorySlug(
    @Param('slug') slug: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.publicService.findProductByCategorySlug(slug, query);
  }
}
