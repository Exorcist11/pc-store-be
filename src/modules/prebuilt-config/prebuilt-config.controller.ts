import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrebuiltConfigService } from './prebuilt-config.service';
import { CreatePrebuiltConfigDto } from './dto/create-prebuilt-config.dto';
import { UpdatePrebuiltConfigDto } from './dto/update-prebuilt-config.dto';

@Controller('prebuilt-config')
export class PrebuiltConfigController {
  constructor(private readonly prebuiltConfigService: PrebuiltConfigService) {}

  @Post()
  create(@Body() createPrebuiltConfigDto: CreatePrebuiltConfigDto) {
    return this.prebuiltConfigService.create(createPrebuiltConfigDto);
  }

  @Get()
  findAll() {
    return this.prebuiltConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prebuiltConfigService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrebuiltConfigDto: UpdatePrebuiltConfigDto) {
    return this.prebuiltConfigService.update(+id, updatePrebuiltConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prebuiltConfigService.remove(+id);
  }
}
