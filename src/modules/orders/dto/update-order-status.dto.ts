// src/orders/dto/update-order-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Trạng thái thanh toán',
    enum: ['unpaid', 'paid', 'failed'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['unpaid', 'paid', 'failed'])
  paymentStatus?: string;
}
