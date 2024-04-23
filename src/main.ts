import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import * as xss from 'xss-clean';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { logger } from './utils/logger.config';
import { AllExceptionFilter } from './filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: logger }),
  );

  const config = new DocumentBuilder()
    .setTitle('Exchange Management Service')
    .setDescription('The Exchange Management Service API of Exchange Tracker System')
    .setVersion('1.0')
    .addTag('EMS')
    .addSecurity('JWT Token', { type: 'apiKey', in: 'header', name: 'token' })
    .build();

  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, swaggerDocumentOptions);
  SwaggerModule.setup('swagger', app, document);

  app.use(helmet());
  app.use(xss());
  app.enableCors();

  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  // app.setGlobalPrefix('api');

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
