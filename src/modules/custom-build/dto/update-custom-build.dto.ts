import { PartialType } from '@nestjs/swagger';
import { CreateCustomBuildDto } from './create-custom-build.dto';

export class UpdateCustomBuildDto extends PartialType(CreateCustomBuildDto) {}
