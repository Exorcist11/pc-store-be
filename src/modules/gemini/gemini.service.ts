import { Injectable } from '@nestjs/common';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { UpdateGeminiDto } from './dto/update-gemini.dto';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../products/schema/product.schema';
import { Model } from 'mongoose';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    this.genAI = new GoogleGenAI({
      // Khởi tạo mới
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async recommendProducts(userQuery: string): Promise<any> {
    // Bước 1: Phân tích userQuery
    const isLaptop = userQuery.toLowerCase().includes('laptop');
    const isDesktop = userQuery.toLowerCase().includes('desktop');
    const isAccessory =
      userQuery.toLowerCase().includes('ram') ||
      userQuery.toLowerCase().includes('accessory');
    const isGaming = userQuery.toLowerCase().includes('gaming');
    const priceMatch = userQuery.match(/dưới\s*(\d+)\s*(triệu|tr)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) * 1000000 : Infinity;
    const ramMatch = userQuery.match(/RAM\s*(\d+)\s*GB/i);
    const ram = ramMatch ? `${parseInt(ramMatch[1])}GB` : null;

    // Bước 2: Query MongoDB
    const matchConditions: any = {
      isActive: true,
    };

    // Lọc productType (nới lỏng để lấy nhiều sản phẩm hơn)
    if (isLaptop || isDesktop || isAccessory) {
      matchConditions.productType = {
        $in: [
          ...(isLaptop ? ['laptop'] : []),
          ...(isDesktop ? ['desktop'] : []),
          ...(isAccessory ? ['accessory'] : []),
        ],
      };
    } else {
      matchConditions.productType = { $in: ['laptop', 'desktop', 'accessory'] }; // Lấy tất cả nếu không chỉ định
    }

    // Lọc category (nới lỏng nếu không có gaming)
    if (isGaming) {
      matchConditions.category = { $regex: 'gaming', $options: 'i' }; // Sử dụng regex thay vì ObjectId cố định
    }

    const products = await this.productModel
      .aggregate([
        { $match: matchConditions },
        { $unwind: '$variants' },
        {
          $match: {
            'variants.stock': { $gt: 0 },
            'variants.price': { $lte: maxPrice },
            ...(ram ? { 'variants.attributes.RAM': ram } : {}),
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            slug: { $first: '$slug' },
            description: { $first: '$description' },
            brand: { $first: '$brand' },
            category: { $first: '$category' },
            productType: { $first: '$productType' },
            allowedAttributes: { $first: '$allowedAttributes' },
            variants: { $push: '$variants' },
            images: { $first: '$images' },
            discount: { $first: '$discount' },
            isActive: { $first: '$isActive' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            __v: { $first: '$__v' },
          },
        },
        { $addFields: { minPrice: { $min: '$variants.price' } } },
        { $sort: { minPrice: 1 } },
        { $limit: 10 },
      ])
      .exec();

    // Bước 3: JSON hóa dữ liệu sản phẩm
    const productsJson =
      products.length > 0
        ? JSON.stringify(
            products.map((p) => ({
              name: p.name,
              slug: p.slug,
              description: p.description,
              productType: p.productType,
              variants: p.variants.map((v) => ({
                sku: v.sku,
                price: v.price,
                attributes: v.attributes,
                images: v.images,
              })),
              images: p.images,
              discount: p.discount,
            })),
          )
        : '[]'; // Trả về mảng rỗng nếu không có sản phẩm

    // Bước 4: Prompt Gemini
    const prompt =
      products.length > 0
        ? `Yêu cầu khách hàng: "${userQuery}".
         Danh sách sản phẩm có sẵn: ${productsJson}.
         Hãy gợi ý 3-5 sản phẩm phù hợp nhất từ danh sách, giải thích lý do, và định dạng output dưới dạng JSON: { recommendations: [{ name, price, reason }] }.`
        : `Yêu cầu khách hàng: "${userQuery}".
         Không có sản phẩm nào trong danh sách phù hợp. Hãy gợi ý 3-5 mẫu laptop gaming phổ biến dưới 20 triệu, RAM 16GB, dựa trên thị trường Việt Nam, và định dạng output dưới dạng JSON: { recommendations: [{ name, price, reason }] }.`;

    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Bước 5: Trích xuất JSON từ response
    const responseText = response.text;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/); // Trích xuất phần JSON
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (error) {
        return { error: 'Failed to parse Gemini JSON', raw: responseText };
      }
    } else {
      return { error: 'No JSON found in Gemini response', raw: responseText };
    }
  }

  
}
