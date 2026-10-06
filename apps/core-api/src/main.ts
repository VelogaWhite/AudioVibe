import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const uiPath = join(process.cwd(), '../web');
  if (existsSync(uiPath)) {
    app.getHttpAdapter().getInstance().use('/ui', express.static(uiPath));
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
