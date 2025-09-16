import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SyncCartItemDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsMongoId()
  product: string;

  @ApiProperty({ description: 'SKU của variant' })
  @IsString()
  @IsNotEmpty()
  variantSku: string;

  @ApiProperty({ description: 'Số lượng' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Giá tại thời điểm thêm' })
  @IsNumber()
  priceAtAdd: number;
}

export class SyncCartDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @ApiProperty({
    description: 'Danh sách items từ client',
    type: [SyncCartItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items: SyncCartItemDto[];
}
