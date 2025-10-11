import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { UpdateGeminiDto } from './dto/update-gemini.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('recommend')
  @ApiOperation({ summary: 'Gợi ý sản phẩm dựa trên query khách hàng' })
  @ApiBody({ schema: { properties: { query: { type: 'string' } } } })
  async recommend(@Body('query') query: string): Promise<any> {
    return this.geminiService.recommendProducts(query);
  }
}
