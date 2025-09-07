import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(query: PaginationQueryDto) {
    const { keyword, index, limit, sort, order } = query;

    const filter: any = {};
    if (keyword) {
      filter.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { fullName: { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (index - 1) * limit;
    const sortOption: Record<string, SortOrder> = {};
    if (sort) {
      sortOption[sort] = order === 'desc' ? -1 : 1;
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      index,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
