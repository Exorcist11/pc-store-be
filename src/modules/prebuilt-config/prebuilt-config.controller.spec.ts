import { Test, TestingModule } from '@nestjs/testing';
import { PrebuiltConfigController } from './prebuilt-config.controller';
import { PrebuiltConfigService } from './prebuilt-config.service';

describe('PrebuiltConfigController', () => {
  let controller: PrebuiltConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrebuiltConfigController],
      providers: [PrebuiltConfigService],
    }).compile();

    controller = module.get<PrebuiltConfigController>(PrebuiltConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
