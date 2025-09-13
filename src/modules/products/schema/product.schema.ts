import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import slugify from 'slugify';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
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
        sku: { type: String, required: true, unique: true },
        slug: { type: String, unique: true },
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
}
export const ProductSchema = SchemaFactory.createForClass(Product);

// Middleware để tự động tạo slug và validate attributes
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

  // Tạo slug cho variants và validate attributes
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

    // Tạo slug cho variant
    if (!variant.slug) {
      const attrValues = Object.values(variant.attributes).join('-');
      let baseSlug = slugify(`${this.name}-${attrValues}`, {
        lower: true,
        strict: true,
      });
      let slug = baseSlug;
      let counter = 1;
      while (
        await ProductModel.findOne({
          'variants.slug': slug,
          'variants.sku': { $ne: variant.sku },
        })
      ) {
        slug = `${baseSlug}-${counter++}`;
      }
      variant.slug = slug;
    }
  }

  next();
});
