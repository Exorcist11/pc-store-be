import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Order Reports')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard tổng quan',
    description: 'Lấy tất cả thống kê quan trọng cho dashboard quản trị',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({ status: 200, description: 'Dữ liệu dashboard thành công' })
  async getDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getDashboard(startDate, endDate);
  }

  @Get('revenue-overview')
  @ApiOperation({
    summary: 'Tổng quan doanh thu',
    description:
      'Thống kê tổng doanh thu, số đơn hàng, giá trị trung bình và tăng trưởng so với kỳ trước',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê doanh thu thành công',
    schema: {
      example: {
        totalRevenue: 50000000,
        totalOrders: 150,
        averageOrderValue: 333333,
        growth: {
          revenue: 15.5,
          orders: 12.3,
        },
      },
    },
  })
  async getRevenueOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getRevenueOverview(startDate, endDate);
  }

  @Get('revenue-by-period')
  @ApiOperation({
    summary: 'Doanh thu theo thời gian',
    description: 'Biểu đồ doanh thu theo ngày, tuần hoặc tháng',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month'],
    description: 'Chu kỳ thống kê',
    example: 'day',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu doanh thu theo chu kỳ',
    schema: {
      example: [
        {
          period: { year: 2025, month: 1, day: 1 },
          revenue: 1500000,
          orders: 5,
          averageOrderValue: 300000,
        },
      ],
    },
  })
  async getRevenueByPeriod(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getRevenueByPeriod(period, startDate, endDate);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Top sản phẩm bán chạy',
    description: 'Danh sách sản phẩm bán chạy nhất theo số lượng và doanh thu',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Số lượng sản phẩm hiển thị',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách top sản phẩm',
    schema: {
      example: [
        {
          productId: '507f1f77bcf86cd799439011',
          productName: 'iPhone 15 Pro Max',
          totalQuantity: 50,
          totalRevenue: 150000000,
          orderCount: 45,
        },
      ],
    },
  })
  async getTopProducts(
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getTopProducts(+limit, startDate, endDate);
  }

  @Get('order-status-stats')
  @ApiOperation({
    summary: 'Thống kê trạng thái đơn hàng',
    description:
      'Số lượng và giá trị đơn hàng theo từng trạng thái (pending, processing, shipped, delivered, cancelled)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê theo trạng thái',
    schema: {
      example: [
        {
          status: 'delivered',
          count: 100,
          totalValue: 30000000,
        },
        {
          status: 'pending',
          count: 20,
          totalValue: 6000000,
        },
      ],
    },
  })
  async getOrderStatusStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getOrderStatusStats(startDate, endDate);
  }

  @Get('payment-method-stats')
  @ApiOperation({
    summary: 'Thống kê phương thức thanh toán',
    description:
      'Phân tích số lượng và giá trị đơn hàng theo phương thức thanh toán',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê phương thức thanh toán',
    schema: {
      example: [
        {
          paymentMethod: 'credit_card',
          count: 80,
          totalValue: 24000000,
          percentage: 60,
        },
        {
          paymentMethod: 'cod',
          count: 50,
          totalValue: 15000000,
          percentage: 40,
        },
      ],
    },
  })
  async getPaymentMethodStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getPaymentMethodStats(startDate, endDate);
  }

  @Get('customer-stats')
  @ApiOperation({
    summary: 'Thống kê khách hàng',
    description:
      'Phân tích khách vãng lai vs đã đăng ký, khách mới vs khách quay lại',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê khách hàng',
    schema: {
      example: {
        guestOrders: 30,
        registeredOrders: 120,
        repeatCustomers: 45,
        totalCustomers: 150,
      },
    },
  })
  async getCustomerStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getCustomerStats(startDate, endDate);
  }

  @Get('conversion-rate')
  @ApiOperation({
    summary: 'Tỷ lệ chuyển đổi đơn hàng',
    description: 'Tỷ lệ đơn hàng thành công vs bị hủy',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Tỷ lệ chuyển đổi',
    schema: {
      example: {
        completed: 130,
        cancelled: 20,
        total: 150,
        conversionRate: 86.67,
      },
    },
  })
  async getConversionRate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getConversionRate(startDate, endDate);
  }

  @Get('average-order-value')
  @ApiOperation({
    summary: 'Giá trị đơn hàng trung bình (AOV)',
    description:
      'Thống kê giá trị trung bình, thấp nhất và cao nhất của đơn hàng',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Giá trị đơn hàng trung bình',
    schema: {
      example: {
        averageValue: 333333,
        minValue: 50000,
        maxValue: 2000000,
      },
    },
  })
  async getAverageOrderValue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getAverageOrderValue(startDate, endDate);
  }

  @Get('sales-by-location')
  @ApiOperation({
    summary: 'Doanh số theo địa điểm',
    description: 'Thống kê doanh thu và số đơn hàng theo quốc gia và thành phố',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Doanh số theo địa điểm',
    schema: {
      example: [
        {
          country: 'Vietnam',
          city: 'Hanoi',
          orderCount: 80,
          totalRevenue: 25000000,
        },
        {
          country: 'Vietnam',
          city: 'Ho Chi Minh',
          orderCount: 70,
          totalRevenue: 22000000,
        },
      ],
    },
  })
  async getSalesByLocation(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getSalesByLocation(startDate, endDate);
  }

  @Get('detailed-orders')
  @ApiOperation({
    summary: 'Báo cáo chi tiết đơn hàng',
    description: 'Danh sách đơn hàng chi tiết với phân trang và bộ lọc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Số đơn hàng mỗi trang',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    description: 'Lọc theo trạng thái',
  })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    enum: ['unpaid', 'paid', 'failed'],
    description: 'Lọc theo trạng thái thanh toán',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng chi tiết',
    schema: {
      example: {
        orders: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 150,
          totalPages: 8,
        },
      },
    },
  })
  async getDetailedOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getDetailedOrders(
      +page,
      +limit,
      status,
      paymentStatus,
      startDate,
      endDate,
    );
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export báo cáo',
    description: 'Xuất báo cáo ra file CSV',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ['orders', 'revenue', 'products'],
    description: 'Loại báo cáo cần export',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'File CSV được tạo thành công',
  })
  async exportReport(
    @Query('type') type: 'orders' | 'revenue' | 'products',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.exportReport(type, startDate, endDate);
  }
}
