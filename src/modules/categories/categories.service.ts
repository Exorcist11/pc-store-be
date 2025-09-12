import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    let level = 1;
    if (dto.parent) {
      const parentCategory = await this.categoryModel
        .findById(dto.parent)
        .exec();
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${dto.parent} not found`,
        );
      }
      level = parentCategory.level + 1;
      if (level > 3) {
        throw new BadRequestException('Category level cannot exceed 3');
      }
    }
    const category = new this.categoryModel({ ...dto, level });
    return category.save();
  }

  async findAll(query: PaginationQueryDto): Promise<any> {
    const { keyword, index, limit, sort, order } = query;

    const filter: any = {};
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { slug: { $regex: keyword, $options: 'i' } },
      ];
    }
    const skip = (index - 1) * limit;
    const sortOption: Record<string, SortOrder> = {};
    if (sort) {
      sortOption[sort] = order === 'desc' ? -1 : 1;
    }

    const [data, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      index,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updateData = { ...updateCategoryDto };

    if (updateData.parent || updateData.parent === null) {
      let level = 1;
      if (updateData.parent) {
        const parentCategory = await this.categoryModel
          .findById(updateData.parent)
          .exec();
        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category with ID ${updateData.parent} not found`,
          );
        }
        level = parentCategory.level + 1;
        if (level > 3) {
          throw new BadRequestException('Category level cannot exceed 3');
        }
      }
      updateData.level = level;
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
