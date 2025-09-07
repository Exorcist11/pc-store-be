import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(dto);
    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category)
      throw new NotFoundException(`Category with ID "${id}" not found`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`Category with ID "${id}" not found`);
    return updated;
  }

  async remove(id: string): Promise<Category> {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Category with ID "${id}" not found`);
    return deleted;
  }
}
