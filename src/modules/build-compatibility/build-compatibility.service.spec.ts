import { Test, TestingModule } from '@nestjs/testing';
import { BuildCompatibilityService } from './build-compatibility.service';

describe('BuildCompatibilityService', () => {
  let service: BuildCompatibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildCompatibilityService],
    }).compile();

    service = module.get<BuildCompatibilityService>(BuildCompatibilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
