import { Injectable } from '@nestjs/common';
import { CreatePrebuiltConfigDto } from './dto/create-prebuilt-config.dto';
import { UpdatePrebuiltConfigDto } from './dto/update-prebuilt-config.dto';

@Injectable()
export class PrebuiltConfigService {
  create(createPrebuiltConfigDto: CreatePrebuiltConfigDto) {
    return 'This action adds a new prebuiltConfig';
  }

  findAll() {
    return `This action returns all prebuiltConfig`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prebuiltConfig`;
  }

  update(id: number, updatePrebuiltConfigDto: UpdatePrebuiltConfigDto) {
    return `This action updates a #${id} prebuiltConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} prebuiltConfig`;
  }
}
