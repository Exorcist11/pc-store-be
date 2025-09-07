import { Module } from '@nestjs/common';
import { PrebuiltConfigService } from './prebuilt-config.service';
import { PrebuiltConfigController } from './prebuilt-config.controller';

@Module({
  controllers: [PrebuiltConfigController],
  providers: [PrebuiltConfigService],
})
export class PrebuiltConfigModule {}
