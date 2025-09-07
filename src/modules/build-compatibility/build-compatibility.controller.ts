import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BuildCompatibilityService } from './build-compatibility.service';
import { CreateBuildCompatibilityDto } from './dto/create-build-compatibility.dto';
import { UpdateBuildCompatibilityDto } from './dto/update-build-compatibility.dto';

@Controller('build-compatibility')
export class BuildCompatibilityController {
  constructor(private readonly buildCompatibilityService: BuildCompatibilityService) {}

  @Post()
  create(@Body() createBuildCompatibilityDto: CreateBuildCompatibilityDto) {
    return this.buildCompatibilityService.create(createBuildCompatibilityDto);
  }

  @Get()
  findAll() {
    return this.buildCompatibilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buildCompatibilityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBuildCompatibilityDto: UpdateBuildCompatibilityDto) {
    return this.buildCompatibilityService.update(+id, updateBuildCompatibilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildCompatibilityService.remove(+id);
  }
}
