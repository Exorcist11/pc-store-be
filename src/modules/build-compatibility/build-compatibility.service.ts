import { Injectable } from '@nestjs/common';
import { CreateBuildCompatibilityDto } from './dto/create-build-compatibility.dto';
import { UpdateBuildCompatibilityDto } from './dto/update-build-compatibility.dto';

@Injectable()
export class BuildCompatibilityService {
  create(createBuildCompatibilityDto: CreateBuildCompatibilityDto) {
    return 'This action adds a new buildCompatibility';
  }

  findAll() {
    return `This action returns all buildCompatibility`;
  }

  findOne(id: number) {
    return `This action returns a #${id} buildCompatibility`;
  }

  update(id: number, updateBuildCompatibilityDto: UpdateBuildCompatibilityDto) {
    return `This action updates a #${id} buildCompatibility`;
  }

  remove(id: number) {
    return `This action removes a #${id} buildCompatibility`;
  }
}
