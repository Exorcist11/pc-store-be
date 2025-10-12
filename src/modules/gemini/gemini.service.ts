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

  private buildMongoQuery(filter: ProductFilter): any[] {
    const pipeline: any[] = [];
    const matchConditions: any = { isActive: true };

    if (filter.productTypes.length > 0) {
      matchConditions.productType = { $in: filter.productTypes };
    }

    if (filter.categories.length > 0) {
      const categoryRegex = filter.categories.join('|');
      matchConditions.category = { $regex: categoryRegex, $options: 'i' };
    }

    if (filter.brands.length > 0) {
      const brandRegex = filter.brands.join('|');
      matchConditions.brand = { $regex: brandRegex, $options: 'i' };
    }

    if (filter.keywords.length > 0) {
      const keywordRegex = filter.keywords.join('|');
      matchConditions.$or = [
        { name: { $regex: keywordRegex, $options: 'i' } },
        { description: { $regex: keywordRegex, $options: 'i' } },
      ];
    }

    pipeline.push({ $match: matchConditions });
    pipeline.push({ $unwind: '$variants' });

    const variantMatch: any = {
      'variants.stock': { $gt: 0 },
    };

    if (filter.priceRange.min !== null) {
      variantMatch['variants.price'] = { $gte: filter.priceRange.min };
    }
    if (filter.priceRange.max !== null) {
      variantMatch['variants.price'] = {
        ...variantMatch['variants.price'],
        $lte: filter.priceRange.max,
      };
    }

    for (const [key, values] of Object.entries(filter.attributes)) {
      if (values.length > 0) {
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

    pipeline.push({ $addFields: { minPrice: { $min: '$variants.price' } } });
    pipeline.push({ $sort: { minPrice: 1 } });
    pipeline.push({ $limit: 15 });

    return pipeline;
  }

  private async populateProducts(products: any[]): Promise<any[]> {
    return await this.productModel.populate(products, [
      { path: 'brand', select: 'name slug' },
      { path: 'category', select: 'name slug level' },
    ]);
  }

  /**
   * Gợi ý sản phẩm từ thị trường (để so sánh hoặc tham khảo)
   */
  private async getMarketSuggestions(
    userQuery: string,
    filter: ProductFilter,
    hasStoreProducts: boolean = false,
  ): Promise<any> {
    const contextMessage = hasStoreProducts
      ? 'Để khách hàng có thêm lựa chọn và so sánh, hãy gợi ý thêm 3-4 sản phẩm KHÁC đang bán trên thị trường Việt Nam (tránh trùng với sản phẩm trong cửa hàng).'
      : 'Hiện tại cửa hàng chưa có sản phẩm phù hợp trong kho. Hãy gợi ý 3-5 sản phẩm ĐANG BÁN trên thị trường Việt Nam (tháng 10/2025) phù hợp với yêu cầu này.';

    const marketPrompt = `Bạn là chuyên gia tư vấn sản phẩm công nghệ tại thị trường Việt Nam.

Yêu cầu của khách hàng: "${userQuery}"

Phân tích yêu cầu: ${JSON.stringify(filter, null, 2)}

${contextMessage}

Yêu cầu:
1. Chọn sản phẩm phổ biến, dễ tìm mua tại Việt Nam
2. Giá cả phù hợp với ngân sách (nếu có)
3. Cung cấp thông số kỹ thuật chi tiết
4. Giải thích rõ tại sao phù hợp
5. Đưa ra mức giá tham khảo thị trường (VNĐ)

Định dạng output (JSON):
{
  "message": "${hasStoreProducts ? 'Một số sản phẩm khác trên thị trường để bạn tham khảo thêm:' : 'Thông báo: Hiện tại cửa hàng chưa có sản phẩm này. Dưới đây là gợi ý từ thị trường:'}",
  "marketSuggestions": [
    {
      "productName": "Tên sản phẩm đầy đủ",
      "brand": "Thương hiệu",
      "model": "Model cụ thể",
      "estimatedPrice": {
        "min": giá thấp nhất (số),
        "max": giá cao nhất (số),
        "currency": "VNĐ"
      },
      "specifications": {
        "CPU": "Chi tiết CPU",
        "RAM": "Chi tiết RAM",
        "Storage": "Chi tiết ổ cứng",
        "VGA": "Chi tiết card đồ họa (nếu có)",
        "Screen": "Kích thước màn hình",
        "OS": "Hệ điều hành",
        "Weight": "Trọng lượng",
        "Battery": "Pin (nếu là laptop)",
        "otherFeatures": ["Tính năng khác 1", "Tính năng khác 2"]
      },
      "reason": "Giải thích chi tiết (3-5 câu) tại sao phù hợp với yêu cầu",
      "pros": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
      "cons": ["Nhược điểm 1", "Nhược điểm 2"],
      "bestFor": "Phù hợp nhất cho đối tượng/công việc gì",
      "availableAt": ["Nơi bán phổ biến 1", "Nơi bán phổ biến 2"],
      "valueScore": điểm giá trị (1-10)
    }
  ],
  "buyingGuide": "Lời khuyên khi mua sản phẩm này (cần chú ý gì, mua ở đâu uy tín, ...)",
  "alternativeSearch": "Gợi ý từ khóa tìm kiếm để khách tự tìm thêm"
}

Chỉ trả về JSON, không giải thích thêm.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: marketPrompt,
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
      console.error('Error getting market suggestions:', error);
      return {
        error: 'Lỗi khi lấy gợi ý từ thị trường',
        details: error.message,
      };
    }
  }

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
      console.log('🔎 Tìm kiếm sản phẩm trong hệ thống...');
      const pipeline = this.buildMongoQuery(filter);
      let products = await this.productModel.aggregate(pipeline).exec();

      // Bước 3: Populate brand và category
      if (products.length > 0) {
        products = await this.populateProducts(products);
      }
      console.log(`✅ Tìm thấy ${products.length} sản phẩm trong hệ thống`);

      // Bước 4: Nếu không có sản phẩm, thử nới lỏng điều kiện
      if (products.length === 0) {
        console.log('⚠️ Không tìm thấy sản phẩm, nới lỏng điều kiện...');
        const relaxedFilter = { ...filter };

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

      // Bước 5: Luôn lấy gợi ý từ thị trường (để khách hàng có thêm lựa chọn)
      console.log('🌐 Lấy thêm gợi ý từ thị trường...');
      const marketSuggestions = await this.getMarketSuggestions(
        userQuery,
        filter,
        products.length > 0, // true nếu có sản phẩm trong store
      );

      // Bước 6: Nếu có sản phẩm trong store, dùng Gemini gợi ý
      if (products.length > 0) {
        console.log('🤖 Gemini đang phân tích sản phẩm có sẵn...');
        const recommendations = await this.getRecommendations(
          userQuery,
          products,
          filter,
        );

        return {
          userQuery,
          analyzedFilter: filter,
          totalProductsFound: products.length,
          source: 'store',
          recommendations,
          marketSuggestions, // Thêm gợi ý từ thị trường
        };
      }

      // Bước 7: Nếu không có sản phẩm, chỉ trả về market suggestions
      return {
        userQuery,
        analyzedFilter: filter,
        totalProductsFound: 0,
        source: 'market',
        marketSuggestions,
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