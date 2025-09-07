import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId;

  @Prop({ default: 0 })
  level: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  sortOrder: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);