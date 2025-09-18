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
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartService: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giỏ hàng mới' })
  @ApiResponse({ status: 201, description: 'Giỏ hàng được tạo thành công.' })
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Post('add')
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiResponse({
    status: 201,
    description: 'Sản phẩm được thêm vào giỏ hàng thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi thêm sản phẩm (ví dụ: không đủ hàng).',
  })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm hoặc variant không tồn tại.',
  })
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(addToCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả giỏ hàng với phân trang và tìm kiếm' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiQuery({ name: 'index', required: false, description: 'Trang hiện tại' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({ name: 'sort', required: false, description: 'Trường sắp xếp' })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Thứ tự sắp xếp',
  })
  @ApiResponse({ status: 200, description: 'Danh sách giỏ hàng.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.cartService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Chi tiết giỏ hàng.' })
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Giỏ hàng được cập nhật.' })
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(id, updateCartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Giỏ hàng được xóa.' })
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Đồng bộ giỏ hàng từ Local Storage sau khi đăng nhập',
  })
  @ApiResponse({
    status: 201,
    description: 'Giỏ hàng được đồng bộ thành công.',
  })
  syncCart(@Body() syncCartDto: SyncCartDto) {
    return this.cartService.syncCart(syncCartDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy giỏ hàng của user theo userId' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Giỏ hàng của user.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giỏ hàng.' })
  findByUser(@Param('userId') userId: string) {
    return this.cartService.findByUser(userId);
  }
}
