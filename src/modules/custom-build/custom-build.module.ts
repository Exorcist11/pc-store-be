import { Module } from '@nestjs/common';
import { CustomBuildService } from './custom-build.service';
import { CustomBuildController } from './custom-build.controller';

@Module({
  controllers: [CustomBuildController],
  providers: [CustomBuildService],
})
export class CustomBuildModule {}
