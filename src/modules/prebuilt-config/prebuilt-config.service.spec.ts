import { Test, TestingModule } from '@nestjs/testing';
import { PrebuiltConfigService } from './prebuilt-config.service';

describe('PrebuiltConfigService', () => {
  let service: PrebuiltConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrebuiltConfigService],
    }).compile();

    service = module.get<PrebuiltConfigService>(PrebuiltConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
