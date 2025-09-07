import { PartialType } from '@nestjs/swagger';
import { CreatePrebuiltConfigDto } from './create-prebuilt-config.dto';

export class UpdatePrebuiltConfigDto extends PartialType(CreatePrebuiltConfigDto) {}
