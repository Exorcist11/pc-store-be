import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Response DTOs
export class RevenueOverviewDto {
  @ApiProperty({ example: 50000000, description: 'Tổng doanh thu' })
  totalRevenue: number;

  @ApiProperty({ example: 150, description: 'Tổng số đơn hàng' })
  totalOrders: number;

  @ApiProperty({ example: 333333, description: 'Giá trị đơn hàng trung bình' })
  averageOrderValue: number;

  @ApiProperty({
    example: { revenue: 15.5, orders: 12.3 },
    description: 'Tăng trưởng so với kỳ trước (%)',
  })
  growth: {
    revenue: number;
    orders: number;
  };
}

export class PeriodRevenueDto {
  @ApiProperty({
    example: { year: 2025, month: 1, day: 15 },
    description: 'Chu kỳ thời gian',
  })
  period: {
    year: number;
    month?: number;
    day?: number;
    week?: number;
  };

  @ApiProperty({ example: 1500000, description: 'Doanh thu trong chu kỳ' })
  revenue: number;

  @ApiProperty({ example: 5, description: 'Số đơn hàng trong chu kỳ' })
  orders: number;

  @ApiProperty({ example: 300000, description: 'Giá trị đơn hàng trung bình' })
  averageOrderValue: number;
}

export class TopProductDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID sản phẩm',
  })
  productId: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Tên sản phẩm' })
  productName: string;

  @ApiProperty({ example: 50, description: 'Tổng số lượng đã bán' })
  totalQuantity: number;

  @ApiProperty({ example: 150000000, description: 'Tổng doanh thu' })
  totalRevenue: number;

  @ApiProperty({ example: 45, description: 'Số đơn hàng' })
  orderCount: number;
}

export class OrderStatusStatsDto {
  @ApiProperty({
    example: 'delivered',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    description: 'Trạng thái đơn hàng',
  })
  status: string;

  @ApiProperty({ example: 100, description: 'Số lượng đơn hàng' })
  count: number;

  @ApiProperty({ example: 30000000, description: 'Tổng giá trị' })
  totalValue: number;
}

export class PaymentMethodStatsDto {
  @ApiProperty({
    example: 'credit_card',
    enum: ['credit_card', 'paypal', 'cod', 'bank_transfer'],
    description: 'Phương thức thanh toán',
  })
  paymentMethod: string;

  @ApiProperty({ example: 80, description: 'Số lượng đơn hàng' })
  count: number;

  @ApiProperty({ example: 24000000, description: 'Tổng giá trị' })
  totalValue: number;

  @ApiProperty({ example: 60, description: 'Phần trăm' })
  percentage: number;
}

export class CustomerStatsDto {
  @ApiProperty({ example: 30, description: 'Số đơn hàng khách vãng lai' })
  guestOrders: number;

  @ApiProperty({ example: 120, description: 'Số đơn hàng từ tài khoản' })
  registeredOrders: number;

  @ApiProperty({ example: 45, description: 'Số khách hàng quay lại' })
  repeatCustomers: number;

  @ApiProperty({ example: 150, description: 'Tổng số khách hàng' })
  totalCustomers: number;
}

export class ConversionRateDto {
  @ApiProperty({ example: 130, description: 'Số đơn hàng thành công' })
  completed: number;

  @ApiProperty({ example: 20, description: 'Số đơn hàng bị hủy' })
  cancelled: number;

  @ApiProperty({ example: 150, description: 'Tổng số đơn hàng' })
  total: number;

  @ApiProperty({ example: 86.67, description: 'Tỷ lệ chuyển đổi (%)' })
  conversionRate: number;
}

export class AverageOrderValueDto {
  @ApiProperty({ example: 333333, description: 'Giá trị trung bình' })
  averageValue: number;

  @ApiProperty({ example: 50000, description: 'Giá trị thấp nhất' })
  minValue: number;

  @ApiProperty({ example: 2000000, description: 'Giá trị cao nhất' })
  maxValue: number;
}

export class SalesByLocationDto {
  @ApiProperty({ example: 'Vietnam', description: 'Quốc gia' })
  country: string;

  @ApiProperty({ example: 'Hanoi', description: 'Thành phố' })
  city: string;

  @ApiProperty({ example: 80, description: 'Số đơn hàng' })
  orderCount: number;

  @ApiProperty({ example: 25000000, description: 'Tổng doanh thu' })
  totalRevenue: number;
}

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ example: 20, description: 'Số items mỗi trang' })
  limit: number;

  @ApiProperty({ example: 150, description: 'Tổng số items' })
  total: number;

  @ApiProperty({ example: 8, description: 'Tổng số trang' })
  totalPages: number;
}

export class DetailedOrdersDto {
  @ApiProperty({ type: [Object], description: 'Danh sách đơn hàng' })
  orders: any[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class DashboardDto {
  @ApiProperty({ type: RevenueOverviewDto })
  revenue: RevenueOverviewDto;

  @ApiProperty({ type: [OrderStatusStatsDto] })
  orderStatus: OrderStatusStatsDto[];

  @ApiProperty({ type: [TopProductDto] })
  topProducts: TopProductDto[];

  @ApiProperty({ type: CustomerStatsDto })
  customerStats: CustomerStatsDto;

  @ApiProperty({ type: [PaymentMethodStatsDto] })
  paymentMethods: PaymentMethodStatsDto[];
}

// Query DTOs
export class DateRangeQueryDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class PeriodQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    example: 'day',
    enum: ['day', 'week', 'month'],
    description: 'Chu kỳ thống kê',
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  period?: 'day' | 'week' | 'month';
}

export class TopProductsQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Số lượng sản phẩm hiển thị',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class DetailedOrdersQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Số trang', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Số items mỗi trang',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    description: 'Lọc theo trạng thái',
  })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({
    example: 'paid',
    enum: ['unpaid', 'paid', 'failed'],
    description: 'Lọc theo trạng thái thanh toán',
  })
  @IsOptional()
  @IsEnum(['unpaid', 'paid', 'failed'])
  paymentStatus?: string;
}

export class ExportQueryDto extends DateRangeQueryDto {
  @ApiProperty({
    example: 'orders',
    enum: ['orders', 'revenue', 'products'],
    description: 'Loại báo cáo cần export',
  })
  @IsEnum(['orders', 'revenue', 'products'])
  type: 'orders' | 'revenue' | 'products';
}
