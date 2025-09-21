import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: Types.ObjectId; // Không bắt buộc cho khách vãng lai

  @Prop({ default: false })
  isGuest: boolean; // Xác định đơn hàng từ khách vãng lai

  @Prop({
    type: {
      email: {
        type: String,
        required: function () {
          return this.isGuest;
        },
      }, // Bắt buộc nếu là khách vãng lai
      firstName: {
        type: String,
        required: function () {
          return this.isGuest;
        },
      },
      lastName: {
        type: String,
        required: function () {
          return this.isGuest;
        },
      },
      phone: { type: String },
    },
    required: function () {
      return this.isGuest;
    }, // Bắt buộc nếu là khách vãng lai
  })
  guestInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        variantSku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items: {
    product: Types.ObjectId;
    variantSku: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true, default: 0 })
  total: number;

  @Prop({
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  status: string;

  @Prop({
    default: 'unpaid',
    enum: ['unpaid', 'paid', 'failed'],
  })
  paymentStatus: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true },
      phone: { type: String },
      recipientName: { type: String, required: true },
    },
    required: true,
  })
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    phone?: string;
    recipientName: string;
  };

  @Prop({
    enum: ['credit_card', 'paypal', 'cod', 'bank_transfer'],
    required: true,
  })
  paymentMethod: string;

  @Prop()
  notes: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre<OrderDocument>('save', function (next) {
  this.total = this.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  if (this.isGuest && this.user) {
    throw new Error('Đơn hàng khách vãng lai không được có user ID');
  }

  if (!this.isGuest && !this.user) {
    throw new Error('Đơn hàng từ tài khoản phải có user ID');
  }

  next();
});
