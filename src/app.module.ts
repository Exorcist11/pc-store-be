import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartsModule } from './modules/carts/carts.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PublicModule } from './modules/public/public.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    CloudinaryModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    OrdersModule,
    CartsModule,
    CouponModule,
    SettingsModule,
    PublicModule,
    GeminiModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
