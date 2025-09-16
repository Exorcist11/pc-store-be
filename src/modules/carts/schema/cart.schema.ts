import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        variantSku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtAdd: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items: {
    product: Types.ObjectId;
    variantSku: string;
    quantity: number;
    priceAtAdd: number;
  }[];

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.pre<CartDocument>('save', function (next) {
  this.total = this.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtAdd,
    0,
  );
  next();
});
