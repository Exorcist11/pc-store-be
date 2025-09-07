import { Injectable } from '@nestjs/common';
import { CreateCustomBuildDto } from './dto/create-custom-build.dto';
import { UpdateCustomBuildDto } from './dto/update-custom-build.dto';

@Injectable()
export class CustomBuildService {
  create(createCustomBuildDto: CreateCustomBuildDto) {
    return 'This action adds a new customBuild';
  }

  findAll() {
    return `This action returns all customBuild`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customBuild`;
  }

  update(id: number, updateCustomBuildDto: UpdateCustomBuildDto) {
    return `This action updates a #${id} customBuild`;
  }

  remove(id: number) {
    return `This action removes a #${id} customBuild`;
  }
}
