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

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
}
