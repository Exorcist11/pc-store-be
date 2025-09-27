import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema/order.schema';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { CartsService } from '../carts/carts.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private productService: ProductsService,
    private userService: UsersService,
    private cartService: CartsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const {
      userId,
      isGuest,
      guestInfo,
      items,
      shippingAddress,
      paymentMethod,
      notes,
    } = createOrderDto;

    // Validate user nếu không phải guest
    if (!isGuest) {
      if (!userId) {
        throw new BadRequestException(
          'User ID là bắt buộc cho tài khoản đăng nhập',
        );
      }
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User không tồn tại');
      }
    } else {
      // Validate guest info
      if (!guestInfo) {
        throw new BadRequestException('Thông tin guest là bắt buộc');
      }
      // Có thể validate email trùng lặp nếu cần
    }

    // Validate và tính price cho items
    const processedItems = [];
    let total = 0;
    for (const itemDto of items) {
      const product = await this.productService.findOne(itemDto.productId);
      if (!product) {
        throw new NotFoundException(
          `Sản phẩm ${itemDto.productId} không tồn tại`,
        );
      }
      // Giả sử lấy variant dựa trên SKU
      const variant = product.variants?.find(
        (v) => v.sku === itemDto.variantSku,
      );
      if (!variant) {
        throw new BadRequestException(
          `Variant SKU ${itemDto.variantSku} không hợp lệ`,
        );
      }

      const item = {
        product: itemDto.productId,
        variantSku: itemDto.variantSku,
        quantity: itemDto.quantity,
        price: variant.price, // Lấy price từ DB
      };
      processedItems.push(item);
      total += item.quantity * item.price;
    }

    // Tạo order document
    const orderData = {
      user: isGuest ? null : userId,
      isGuest,
      guestInfo: isGuest ? guestInfo : undefined,
      items: processedItems,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingAddress,
      paymentMethod,
      notes,
      isActive: true,
    };

    const createdOrder = new this.orderModel(orderData);
    const savedOrder = await createdOrder.save();

    try {
      await this.cartService.removeItemsFromCart(userId, null);
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
    }

    return savedOrder;
  }

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ isActive: true })
      .populate('user items.product')
      .exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('user items.product')
      .exec();
    if (!order) {
      throw new NotFoundException('Order không tồn tại');
    }
    return order;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
