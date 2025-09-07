import { Test, TestingModule } from '@nestjs/testing';
import { BuildCompatibilityController } from './build-compatibility.controller';
import { BuildCompatibilityService } from './build-compatibility.service';

describe('BuildCompatibilityController', () => {
  let controller: BuildCompatibilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildCompatibilityController],
      providers: [BuildCompatibilityService],
    }).compile();

    controller = module.get<BuildCompatibilityController>(BuildCompatibilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
