import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DisableMethodsMiddleware } from './middleware/disable-methods/disable-methods.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new DisableMethodsMiddleware().use);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('EchoBot API  docs')
    .setDescription('EchoBot API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
