import {
  BadRequestException,
  ValidationPipe,
  RequestMethod,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PinoLogger } from './common/logging/pino.logger';
import { RedisIoAdapter } from './redis-io.adapter';

const appLogger = new PinoLogger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: appLogger });
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formatted = errors.map((e) => ({
          field: e.property,
          message: Object.values(e.constraints ?? {}).join(', '),
        }));
        return new BadRequestException({ statusCode: 400, errors: formatted });
      },
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? [
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });
  const globalPrefix = 'api';
  app.useGlobalFilters(new HttpExceptionFilter(appLogger));
  app.setGlobalPrefix(globalPrefix, {
    exclude: [{ path: 'metrics', method: RequestMethod.GET }],
  });
  const port = process.env.PORT || 3000;
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Learning Hub API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);
  appLogger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
