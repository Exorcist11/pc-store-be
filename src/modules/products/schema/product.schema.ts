import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import slugify from 'slugify';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ required: true, enum: ['laptop', 'desktop', 'accessory'] })
  productType: string;

  @Prop({ type: [String], default: [] })
  allowedAttributes: string[];

  @Prop({
    type: [
      {
        sku: { type: String, required: true },
        slug: { type: String },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        attributes: { type: Object, required: true },
        images: { type: [String], default: [] },
      },
    ],
    required: true,
    default: [],
  })
  variants: {
    sku: string;
    slug: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
    images: string[];
  }[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre<ProductDocument>('save', async function (next) {
  const ProductModel = this.constructor as Model<ProductDocument>;

  // Tạo slug cho sản phẩm từ name
  if (this.isModified('name') || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await ProductModel.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  // Validate & generate slug cho từng variant
  for (const variant of this.variants) {
    // Validate attributes
    if (this.allowedAttributes.length > 0) {
      for (const key of Object.keys(variant.attributes)) {
        if (!this.allowedAttributes.includes(key)) {
          throw new Error(
            `Thuộc tính '${key}' không được phép cho sản phẩm này`,
          );
        }
      }
    }

    // ✅ Check SKU unique trong toàn bộ collection
    if (variant.sku) {
      const exist = await ProductModel.findOne({
        'variants.sku': variant.sku,
        _id: { $ne: this._id },
      });
      if (exist) {
        throw new Error(`SKU '${variant.sku}' đã tồn tại`);
      }
    }

    // ✅ Generate slug cho variant nếu chưa có
    if (!variant.slug && variant.sku) {
      let baseSlug = slugify(variant.sku, {
        lower: true,
        strict: true,
      });
      let slug = baseSlug;
      let counter = 1;

      while (
        await ProductModel.findOne({
          'variants.slug': slug,
          _id: { $ne: this._id },
        })
      ) {
        slug = `${baseSlug}-${counter++}`;
      }

      variant.slug = slug;
    }
  }

  next();
});
