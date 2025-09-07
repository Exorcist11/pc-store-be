import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import type { Express } from 'express';

let server: Express;

async function bootstrap(): Promise<Express> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global filters & interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('PC Store API')
    .setDescription('API documentation for PC Store')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('/', app, () =>
    SwaggerModule.createDocument(app, config),
  );

  // Static assets
  app.useStaticAssets(join(__dirname, '..', 'node_modules', 'swagger-ui-dist'));

  app.enableCors({ origin: '*' });

  await app.init(); // ❌ không dùng listen()

  return app.getHttpAdapter().getInstance() as Express;
}

// Vercel sẽ gọi hàm này
export default async function handler(req, res) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}
