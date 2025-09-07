import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand, BrandDocument } from './schema/brand.schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = new this.brandModel(createBrandDto);
    return brand.save();
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
      this.brandModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .exec(),
      this.brandModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      index,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id).exec();
    if (!brand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const updatedBrand = await this.brandModel
      .findByIdAndUpdate(id, updateBrandDto, { new: true })
      .exec();

    if (!updatedBrand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }
    return updatedBrand;
  }

  async remove(id: string): Promise<Brand> {
    const deletedBrand = await this.brandModel.findByIdAndDelete(id).exec();
    if (!deletedBrand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }
    return deletedBrand;
  }
}
