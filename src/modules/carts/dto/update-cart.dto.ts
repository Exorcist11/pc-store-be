import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @ApiPropertyOptional({ description: 'Danh sách items mới (có thể overwrite)' })
  items?: CreateCartDto['items'];
}