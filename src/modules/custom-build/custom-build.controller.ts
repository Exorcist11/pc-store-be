import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomBuildService } from './custom-build.service';
import { CreateCustomBuildDto } from './dto/create-custom-build.dto';
import { UpdateCustomBuildDto } from './dto/update-custom-build.dto';

@Controller('custom-build')
export class CustomBuildController {
  constructor(private readonly customBuildService: CustomBuildService) {}

  @Post()
  create(@Body() createCustomBuildDto: CreateCustomBuildDto) {
    return this.customBuildService.create(createCustomBuildDto);
  }

  @Get()
  findAll() {
    return this.customBuildService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customBuildService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomBuildDto: UpdateCustomBuildDto) {
    return this.customBuildService.update(+id, updateCustomBuildDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customBuildService.remove(+id);
  }
}
