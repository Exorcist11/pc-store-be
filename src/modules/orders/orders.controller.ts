import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Order } from './schema/order.schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo order thành công',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  // @UseGuards(AuthGuard('jwt')) // Uncomment nếu cần auth
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả đơn hàng với phân trang và tìm kiếm',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Tìm kiếm theo email user, email guest, hoặc ghi chú',
    example: 'example@email.com',
  })
  @ApiQuery({
    name: 'index',
    required: false,
    example: 1,
    description: 'Trang hiện tại (bắt đầu từ 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Số lượng bản ghi mỗi trang',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'createdAt',
    description: 'Trường để sắp xếp',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
    description: 'Thứ tự sắp xếp',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách đơn hàng với phân trang.',
  })
  async findAll(@Query() query: PaginationQueryDto): Promise<any> {
    return await this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy đơn hàng theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID đơn hàng',
    example: '60d5ec49f1a2c4b3b8f1a2c4',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết đơn hàng', type: Order })
  @ApiResponse({ status: 404, description: 'Order không tồn tại' })
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái và thanh toán của đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: Order })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
