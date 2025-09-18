import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schema/cart.schema';
import { Model, SortOrder, Types } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productService: ProductsService,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const createdCart = new this.cartModel(createCartDto);
    return createdCart.save();
  }

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { user, product, quantity, variantSku } = addToCartDto;

    const productDoc = await this.productService.findOne(product);

    if (!productDoc) {
      throw new NotFoundException(`Sản phẩm ${product} không tồn tại`);
    }

    const variant = productDoc.variants.find((v) => v.sku === variantSku);

    if (!variant) {
      throw new NotFoundException(`Variant ${variantSku} không tồn tại`);
    }

    if (variant.stock < quantity) {
      throw new BadRequestException(
        `Không đủ hàng cho ${variantSku}. Còn lại ${variant.stock}`,
      );
    }

    let cart = await this.cartModel.findOne({ user, isActive: true });

    if (cart) {
      const existingItem = cart.items.find(
        (item) =>
          item.product.toString() === product && item.variantSku === variantSku,
      );

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > variant.stock) {
          throw new BadRequestException(
            `Số lượng vượt quá kho: ${variantSku}. Còn lại: ${variant.stock}`,
          );
        }

        existingItem.quantity = newQty;
      } else {
        cart.items.push({
          product: new Types.ObjectId(product),
          variantSku,
          quantity,
          priceAtAdd: variant.price,
        });
      }
    } else {
      cart = new this.cartModel({
        user,
        items: [
          {
            product,
            variantSku,
            quantity,
            priceAtAdd: variant.price,
          },
        ],
        isActive: true,
      });
    }

    cart.total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtAdd,
      0,
    );

    return cart.save();
  }

  async findAll(query: PaginationQueryDto) {
    const { keyword, index, limit, sort, order } = query;

    const filter: any = {};
    if (keyword) {
      filter.$or = [
        { user: { $regex: keyword, $options: 'i' } },
        { 'items.product': { $regex: keyword, $options: 'i' } },
      ];
    }
    const skip = (index - 1) * limit;
    const sortOption: Record<string, SortOrder> = {};
    if (sort) {
      sortOption[sort] = order === 'desc' ? -1 : 1;
    }

    const [data, total] = await Promise.all([
      this.cartModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate('items.product')
        .exec(),
      this.cartModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      index,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Cart> {
    return this.cartModel.findById(id).populate('items.product').exec();
  }

  async update(id: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    return this.cartModel
      .findByIdAndUpdate(id, updateCartDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Cart> {
    return this.cartModel.findByIdAndDelete(id).exec();
  }

  async syncCart(syncCartDto: SyncCartDto): Promise<Cart> {
    const { user, items } = syncCartDto;

    for (const item of items) {
      const product = await this.productService.findOne(item.product);
      if (!product) {
        throw new NotFoundException(`Sản phẩm ${item.product} không tồn tại`);
      }
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) {
        throw new NotFoundException(`Variant ${item.variantSku} không tồn tại`);
      }

      if (variant.stock < item.quantity) {
        throw new BadRequestException(`Không đủ hàng cho ${item.variantSku}`);
      }
    }

    let cart = await this.cartModel.findOne({ user });

    if (cart) {
      for (const newItem of items) {
        const existingItem = cart.items.find(
          (i) =>
            i.product.toString() === newItem.product &&
            i.variantSku === newItem.variantSku,
        );
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push({
            product: new Types.ObjectId(newItem.product),
            variantSku: newItem.variantSku,
            quantity: newItem.quantity,
            priceAtAdd: newItem.priceAtAdd,
          });
        }
      }
    } else {
      cart = new this.cartModel({
        user,
        items,
        isActive: true,
      });
    }

    return cart.save();
  }

  async findByUser(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ user: userId, isActive: true })
      .populate('items.product')
      .exec();

    if (!cart) {
      throw new NotFoundException(`Không tìm thấy giỏ hàng cho user ${userId}`);
    }

    return cart;
  }
}
