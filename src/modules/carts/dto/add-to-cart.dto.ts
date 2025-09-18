import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsMongoId()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ description: 'SKU của variant' })
  @IsString()
  @IsNotEmpty()
  variantSku: string;

  @ApiProperty({ description: 'Số lượng muốn thêm' })
  @IsNumber()
  @Min(1)
  quantity: number;
}
