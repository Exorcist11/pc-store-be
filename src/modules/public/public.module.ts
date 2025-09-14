import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { ProductsModule } from '../products/products.module';
import { BrandsModule } from '../brands/brands.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [CategoriesModule, BrandsModule, ProductsModule],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
