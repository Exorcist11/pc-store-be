import { Test, TestingModule } from '@nestjs/testing';
import { CustomBuildService } from './custom-build.service';

describe('CustomBuildService', () => {
  let service: CustomBuildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomBuildService],
    }).compile();

    service = module.get<CustomBuildService>(CustomBuildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
