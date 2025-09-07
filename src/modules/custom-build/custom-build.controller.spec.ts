import { Test, TestingModule } from '@nestjs/testing';
import { CustomBuildController } from './custom-build.controller';
import { CustomBuildService } from './custom-build.service';

describe('CustomBuildController', () => {
  let controller: CustomBuildController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomBuildController],
      providers: [CustomBuildService],
    }).compile();

    controller = module.get<CustomBuildController>(CustomBuildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
