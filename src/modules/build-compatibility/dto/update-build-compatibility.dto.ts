import { PartialType } from '@nestjs/swagger';
import { CreateBuildCompatibilityDto } from './create-build-compatibility.dto';

export class UpdateBuildCompatibilityDto extends PartialType(CreateBuildCompatibilityDto) {}
