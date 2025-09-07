import { Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'CLOUDINARY',
      useFactory: (config: ConfigService) => {
        return cloudinary.config({
          cloud_name: config.get<string>('CLOUD_NAME'),
          api_key: config.get<string>('API_KEY'),
          api_secret: config.get<string>('API_SECRET'),
        });
      },
      inject: [ConfigService],
    },
    CloudinaryService,
  ],
  controllers: [CloudinaryController],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
