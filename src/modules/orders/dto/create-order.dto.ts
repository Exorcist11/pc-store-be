import {
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty({ description: 'Địa chỉ đường phố', example: '123 Đường ABC' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ description: 'Thành phố', example: 'Hà Nội' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Tỉnh/Bang', example: 'Hà Nội', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Quốc gia', example: 'Việt Nam' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Tên người nhận', example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  recipientName: string;
}

export class OrderItemDto {
  @ApiProperty({
    description: 'ID sản phẩm',
    example: '60d5ec49f1a2c4b3b8f1a2c4',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'SKU variant', example: 'SKU123' })
  @IsNotEmpty()
  @IsString()
  variantSku: string;

  @ApiProperty({ description: 'Số lượng', example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class GuestInfoDto {
  @ApiProperty({
    description: 'Email khách vãng lai',
    example: 'guest@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Họ', example: 'Nguyễn' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Tên', example: 'Văn A' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID user (optional nếu là guest)',
    example: '60d5ec49f1a2c4b3b8f1a2c4',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Có phải guest không? (default: false)',
    example: false,
  })
  @IsOptional()
  isGuest: boolean = false;

  @ApiProperty({
    description: 'Thông tin guest (bắt buộc nếu isGuest=true)',
    type: GuestInfoDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInfoDto)
  guestInfo?: GuestInfoDto;

  @ApiProperty({ description: 'Danh sách items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({
    enum: ['credit_card', 'paypal', 'cod', 'bank_transfer'],
    example: 'cod',
    description: 'Phương thức thanh toán',
  })
  @IsNotEmpty()
  @IsEnum(['credit_card', 'paypal', 'cod', 'bank_transfer'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Giao nhanh',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
