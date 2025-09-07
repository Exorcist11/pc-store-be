import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand, BrandDocument } from './schema/brand.schema';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = new this.brandModel(createBrandDto);
    return brand.save();
  }

  async findAll(): Promise<Brand[]> {
    return this.brandModel.find().exec();
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
