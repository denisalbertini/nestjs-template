import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './config/app.config';

(async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app, true);

  const configService = app.get(ConfigService);

  await app.listen(configService.get('PORT') || 3000);
})();
