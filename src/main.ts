import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Exception filter global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Response interceptor global
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const config = new DocumentBuilder()
    .setTitle('PC Store API')
    .setDescription('API documentation for PC Store')
    .setVersion('1.0')
    // .addTag('API')
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: '*',
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'node_modules', 'swagger-ui-dist'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
