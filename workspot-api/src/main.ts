import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  const config = new DocumentBuilder()
    .setTitle('WorkSpot API')
    .setDescription('The WorkSpot API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication related endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Spots', 'Spots management endpoints')
    .addTag('Reviews', 'Reviews management endpoints')
    .addTag('Favorites', 'Favorites management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
