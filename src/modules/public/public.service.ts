import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../products/schema/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SortOrder } from 'mongoose';

@Injectable()
export class PublicService {
  constructor(
    private readonly productService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
  ) {}

  async findProductBySlug(slug: string): Promise<Product> {
    const product = await this.productService.findBySlug(slug);
    if (!product)
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    return product;
  }

  async findFeaturesProduct(query: PaginationQueryDto) {
    const { keyword, index = 1, limit = 10, sort, order } = query;

    const [data] = await Promise.all([
      this.productService.findAll({
        keyword,
        index,
        limit,
        sort,
        order,
      }),
      this.productService.count({ keyword }),
    ]);

    return data;
  }

  async findCategory(query: PaginationQueryDto) {
    const { keyword, index = 1, limit = 100, sort, order } = query;

    const [data] = await Promise.all([
      this.categoriesService.findAll({
        keyword,
        index,
        limit,
        sort,
        order,
      }),
    ]);

    return data;
  }
}
