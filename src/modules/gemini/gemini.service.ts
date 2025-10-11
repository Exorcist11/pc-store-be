import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../products/schema/product.schema';
import { Model } from 'mongoose';
import { GoogleGenAI } from '@google/genai';

interface ProductFilter {
  productTypes: string[];
  categories: string[];
  brands: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  attributes: Record<string, string[]>;
  keywords: string[];
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    this.genAI = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  private async analyzeUserQuery(userQuery: string): Promise<ProductFilter> {
    const analysisPrompt = `Bạn là một trợ lý phân tích yêu cầu mua sắm sản phẩm công nghệ tại Việt Nam.

Yêu cầu của khách hàng: "${userQuery}"

Hãy phân tích yêu cầu và trích xuất thông tin dưới dạng JSON với cấu trúc sau:
{
  "productTypes": ["laptop" | "desktop" | "accessory"],
  "categories": ["gaming", "văn phòng", "đồ họa", "sinh viên", ...],
  "brands": ["asus", "dell", "hp", "lenovo", "acer", "msi", ...],
  "priceRange": {
    "min": số tiền tối thiểu (VNĐ) hoặc null,
    "max": số tiền tối đa (VNĐ) hoặc null
  },
  "attributes": {
    "CPU": ["Intel Core i5", "Intel Core i7", "AMD Ryzen 5", ...],
    "RAM": ["8GB", "16GB", "32GB", ...],
    "Storage": ["256GB SSD", "512GB SSD", "1TB HDD", ...],
    "VGA": ["RTX 3050", "RTX 4060", "GTX 1650", ...],
    "Screen": ["15.6 inch", "14 inch", ...],
    "color": ["đen", "bạc", "xám", ...]
  },
  "keywords": ["từ khóa quan trọng khác"]
}

Lưu ý:
- Nếu không có thông tin về trường nào, để mảng rỗng [] hoặc null
- Giá tiền: "20 triệu", "20tr", "dưới 20 triệu" -> max: 20000000
- RAM: "16GB", "RAM 16GB" -> ["16GB"]
- Hãy suy luận từ ngữ cảnh (VD: "gaming" -> có thể cần VGA rời, RAM cao)

Chỉ trả về JSON, không giải thích thêm.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: analysisPrompt,
      });

      const responseText = response.text;
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }

      throw new Error('Không thể phân tích response từ Gemini');
    } catch (error) {
      console.error('Error analyzing user query:', error);
      // Fallback: trả về filter rỗng
      return {
        productTypes: [],
        categories: [],
        brands: [],
        priceRange: { min: null, max: null },
        attributes: {},
        keywords: [],
      };
    }
  }

  /**
   * Bước 2: Xây dựng query MongoDB dựa trên kết quả phân tích (không dùng text index)
   */
  private buildMongoQuery(filter: ProductFilter): any[] {
    const pipeline: any[] = [];

    // Match điều kiện cơ bản
    const matchConditions: any = { isActive: true };

    // Lọc productType
    if (filter.productTypes.length > 0) {
      matchConditions.productType = { $in: filter.productTypes };
    }

    // Lọc category (sử dụng regex)
    if (filter.categories.length > 0) {
      const categoryRegex = filter.categories.join('|');
      matchConditions.category = { $regex: categoryRegex, $options: 'i' };
    }

    // Lọc brand (sử dụng regex)
    if (filter.brands.length > 0) {
      const brandRegex = filter.brands.join('|');
      matchConditions.brand = { $regex: brandRegex, $options: 'i' };
    }

    // Tìm kiếm theo keywords (dùng regex cho name và description)
    if (filter.keywords.length > 0) {
      const keywordRegex = filter.keywords.join('|');
      matchConditions.$or = [
        { name: { $regex: keywordRegex, $options: 'i' } },
        { description: { $regex: keywordRegex, $options: 'i' } },
      ];
    }

    pipeline.push({ $match: matchConditions });

    // Unwind variants
    pipeline.push({ $unwind: '$variants' });

    // Match điều kiện variant
    const variantMatch: any = {
      'variants.stock': { $gt: 0 },
    };

    // Lọc price range
    if (filter.priceRange.min !== null) {
      variantMatch['variants.price'] = { $gte: filter.priceRange.min };
    }
    if (filter.priceRange.max !== null) {
      variantMatch['variants.price'] = {
        ...variantMatch['variants.price'],
        $lte: filter.priceRange.max,
      };
    }

    // Lọc attributes
    for (const [key, values] of Object.entries(filter.attributes)) {
      if (values.length > 0) {
        // Sử dụng regex để match linh hoạt hơn (VD: "16GB" match với "16 GB")
        const attrRegex = values
          .map((v) => v.replace(/\s+/g, '\\s*'))
          .join('|');
        variantMatch[`variants.attributes.${key}`] = {
          $regex: attrRegex,
          $options: 'i',
        };
      }
    }

    pipeline.push({ $match: variantMatch });

    // Group lại theo product
    pipeline.push({
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
      },
    });

    // Thêm minPrice và sort
    pipeline.push({ $addFields: { minPrice: { $min: '$variants.price' } } });
    pipeline.push({ $sort: { minPrice: 1 } });
    pipeline.push({ $limit: 15 });

    return pipeline;
  }

  /**
   * Bước 3: Populate brand và category
   */
  private async populateProducts(products: any[]): Promise<any[]> {
    return await this.productModel.populate(products, [
      { path: 'brand', select: 'name slug' },
      { path: 'category', select: 'name slug level' },
    ]);
  }

  /**
   * Bước 4: Sử dụng Gemini để gợi ý sản phẩm tốt nhất
   */
  private async getRecommendations(
    userQuery: string,
    products: any[],
    filter: ProductFilter,
  ): Promise<any> {
    const productsJson = JSON.stringify(
      products.map((p) => ({
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand?.name || 'N/A',
        category: p.category?.name || 'N/A',
        productType: p.productType,
        minPrice: p.minPrice,
        discount: p.discount,
        variants: p.variants.map((v) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          attributes: v.attributes,
        })),
        images: p.images,
      })),
      null,
      2,
    );

    const recommendationPrompt = `Bạn là chuyên gia tư vấn sản phẩm công nghệ.

Yêu cầu của khách hàng: "${userQuery}"

Phân tích yêu cầu: ${JSON.stringify(filter, null, 2)}

Danh sách sản phẩm có sẵn:
${productsJson}

Nhiệm vụ:
1. Phân tích kỹ yêu cầu của khách hàng và đặc điểm từng sản phẩm
2. Chọn 3-5 sản phẩm phù hợp NHẤT (ưu tiên sản phẩm có tồn kho)
3. Với mỗi sản phẩm, chọn variant phù hợp nhất
4. Giải thích rõ ràng tại sao sản phẩm phù hợp với nhu cầu
5. So sánh ưu/nhược điểm nếu có nhiều lựa chọn
6. Đưa ra lời khuyên về giá trị đồng tiền

Định dạng output (JSON):
{
  "summary": "Tóm tắt ngắn gọn về nhu cầu và đề xuất tổng quan",
  "recommendations": [
    {
      "productName": "Tên sản phẩm",
      "productSlug": "slug-san-pham",
      "variantSku": "SKU của variant được chọn",
      "price": giá tiền (số),
      "discount": % giảm giá,
      "finalPrice": giá sau giảm (số),
      "attributes": {
        "CPU": "...",
        "RAM": "...",
        ...các thông số quan trọng
      },
      "reason": "Giải thích chi tiết tại sao phù hợp (3-5 câu)",
      "pros": ["Ưu điểm 1", "Ưu điểm 2", ...],
      "cons": ["Nhược điểm 1", "Nhược điểm 2", ...],
      "valueScore": điểm giá trị (1-10)
    }
  ],
  "advice": "Lời khuyên thêm cho khách hàng"
}

Chỉ trả về JSON, không giải thích thêm.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: recommendationPrompt,
      });

      const responseText = response.text;
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }

      return { error: 'Không thể phân tích response', raw: responseText };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        error: 'Lỗi khi xử lý gợi ý sản phẩm',
        details: error.message,
      };
    }
  }

  /**
   * Main function: Phân tích và gợi ý sản phẩm
   */
  async recommendProducts(userQuery: string): Promise<any> {
    try {
      // Bước 1: Phân tích yêu cầu bằng Gemini
      console.log('🔍 Phân tích yêu cầu khách hàng...');
      const filter = await this.analyzeUserQuery(userQuery);
      console.log('✅ Kết quả phân tích:', JSON.stringify(filter, null, 2));

      // Bước 2: Query MongoDB
      console.log('🔎 Tìm kiếm sản phẩm...');
      const pipeline = this.buildMongoQuery(filter);
      let products = await this.productModel.aggregate(pipeline).exec();

      // Bước 3: Populate brand và category
      if (products.length > 0) {
        products = await this.populateProducts(products);
      }
      console.log(`✅ Tìm thấy ${products.length} sản phẩm`);

      // Bước 4: Nếu không có sản phẩm, nới lỏng điều kiện
      if (products.length === 0) {
        console.log('⚠️ Không tìm thấy sản phẩm, nới lỏng điều kiện...');
        const relaxedFilter = { ...filter };

        // Chỉ giữ productType và priceRange
        relaxedFilter.categories = [];
        relaxedFilter.brands = [];
        relaxedFilter.attributes = {};
        relaxedFilter.keywords = [];

        const relaxedPipeline = this.buildMongoQuery(relaxedFilter);
        products = await this.productModel.aggregate(relaxedPipeline).exec();

        if (products.length > 0) {
          products = await this.populateProducts(products);
        }

        console.log(`✅ Tìm thấy ${products.length} sản phẩm sau khi nới lỏng`);
      }

      // Bước 5: Sử dụng Gemini để gợi ý
      console.log('🤖 Gemini đang phân tích và gợi ý...');
      const recommendations = await this.getRecommendations(
        userQuery,
        products,
        filter,
      );

      return {
        userQuery,
        analyzedFilter: filter,
        totalProductsFound: products.length,
        recommendations,
      };
    } catch (error) {
      console.error('❌ Error in recommendProducts:', error);
      return {
        error: 'Có lỗi xảy ra khi xử lý yêu cầu',
        details: error.message,
      };
    }
  }
}
