import { Module } from '@nestjs/common';
import { BuildCompatibilityService } from './build-compatibility.service';
import { BuildCompatibilityController } from './build-compatibility.controller';

@Module({
  controllers: [BuildCompatibilityController],
  providers: [BuildCompatibilityService],
})
export class BuildCompatibilityModule {}
