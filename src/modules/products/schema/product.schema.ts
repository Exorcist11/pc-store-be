import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: false })
export class ProductDimensions {
  @Prop()
  length: number;

  @Prop()
  width: number;

  @Prop()
  height: number;
}

@Schema({ _id: false })
export class ProductCompatibility {
  @Prop({ type: [String], default: [] })
  sockets: string[];

  @Prop({ type: [String], default: [] })
  memoryTypes: string[];

  @Prop()
  maxMemory: number;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brandId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['component', 'laptop', 'prebuilt', 'accessory'],
  })
  productType: string;

  @Prop()
  description: string;

  @Prop()
  shortDescription: string;

  @Prop({ type: Object, default: {} })
  specifications: Record<string, any>;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  price: number;

  @Prop()
  comparePrice: number;

  @Prop()
  costPrice: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ default: 5 })
  minStock: number;

  @Prop()
  weight: number;

  @Prop({ type: ProductDimensions })
  dimensions: ProductDimensions;

  @Prop({ type: ProductCompatibility })
  compatibility: ProductCompatibility;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  seoTitle: string;

  @Prop()
  seoDescription: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
