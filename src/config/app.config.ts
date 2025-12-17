import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomFilter } from 'src/filters/custom.filter';
import { configureSwagger } from './swagger.config';

export function configureApp(app: INestApplication, prod: boolean) {
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CustomFilter(httpAdapter));

  if (prod) {
    configureSwagger(app);
  }
}
