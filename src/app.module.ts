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
import { PrebuiltConfigModule } from './modules/prebuilt-config/prebuilt-config.module';
import { CustomBuildModule } from './modules/custom-build/custom-build.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartsModule } from './modules/carts/carts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BuildCompatibilityModule } from './modules/build-compatibility/build-compatibility.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotificationModule } from './modules/notification/notification.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

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
    PrebuiltConfigModule,
    CustomBuildModule,
    OrdersModule,
    CartsModule,
    ReviewsModule,
    CouponModule,
    InventoryModule,
    BuildCompatibilityModule,
    SettingsModule,
    NotificationModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
