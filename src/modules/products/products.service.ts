import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schema/product.schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findOne(dto.category);
    if (!category) {
      throw new NotFoundException(
        `Category with ID "${dto.category}" not found`,
      );
    }

    const brand = await this.brandsService.findOne(dto.brand);
    if (!brand) {
      throw new NotFoundException(`Brand with ID "${dto.brand}" not found`);
    }

    const product = new this.productModel(dto);
    return await product.save();
  }

  async findAll(query: PaginationQueryDto) {
    const { keyword, index, limit, sort, order } = query;

    const filter: any = {};
    if (keyword) {
      filter.$or = [{ name: { $regex: keyword, $options: 'i' } }];
    }
    const skip = (index - 1) * limit;
    const sortOption: Record<string, SortOrder> = {};
    if (sort) {
      sortOption[sort] = order === 'desc' ? -1 : 1;
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      index,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async count(filter: { keyword?: string }) {
    const query: any = {};
    if (filter.keyword) {
      query.name = { $regex: filter.keyword, $options: 'i' };
    }
    return this.productModel.countDocuments(query).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  async findByCategorySlug(slug: string, query: PaginationQueryDto) {
    const { keyword, index = 1, limit = 10, sort, order } = query;

    const category = await this.categoriesService.findBySlug(slug);

    if (!category) {
      throw new NotFoundException(`Category với slug "${slug}" không tồn tại`);
    }

    const skip = (index - 1) * limit;
    const sortOption: Record<string, SortOrder> = {};
    if (sort) {
      sortOption[sort] = order === 'desc' ? -1 : 1;
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find({ category: category._id.toString() })
        .populate('brand', 'name')
        .populate('category', 'name')
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .exec(),
      this.productModel.countDocuments({ category: category._id.toString() }),
    ]);

    return {
      items: data,
      total,
      index,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug })
      .populate('brand', 'name')
      .populate('category', 'name')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    if (dto.category) {
      const category = await this.categoriesService.findOne(dto.category);
      if (!category)
        throw new NotFoundException(
          `Category with ID "${dto.category}" not found`,
        );
    }

    if (dto.brand) {
      const brand = await this.brandsService.findOne(dto.brand);
      if (!brand)
        throw new NotFoundException(`Brand with ID "${dto.brand}" not found`);
    }

    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return updated;
  }

  async remove(id: string): Promise<Product> {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return deleted;
  }
}
