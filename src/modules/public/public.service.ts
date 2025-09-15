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

    const [data, total] = await Promise.all([
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

  async findProductByCategorySlug(slug: string, query: PaginationQueryDto) {
    return this.productService.findByCategorySlug(slug, query);
  }

  async findCategory(query: PaginationQueryDto) {
    const {
      keyword,
      index = 1,
      limit = 100,
      sort = 'createdAt',
      order = 'desc',
    } = query;

    // Lấy danh sách categories
    const categories = await this.categoriesService.findAll({
      keyword,
      index,
      limit,
      sort,
      order,
    });

    // Đếm số lượng sản phẩm theo category (1 query duy nhất)
    const counts = await this.productService['productModel'].aggregate([
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
        },
      },
    ]);

    // Convert counts thành object để tra nhanh
    const countsMap = counts.reduce(
      (acc, cur) => {
        acc[cur._id.toString()] = cur.productCount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Gắn productCount vào từng category
    const result = categories?.items.map((cat) => ({
      ...cat,
      productCount: countsMap[cat._id.toString()] || 0,
    }));

    return result;
  }
}
