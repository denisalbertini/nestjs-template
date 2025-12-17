import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

export function configureSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bike Sharing System API')
    .setOpenAPIVersion('3.0.4')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/doc', app, swaggerDoc);

  writeFileSync(
    join(process.cwd(), 'swagger.json'),
    JSON.stringify(swaggerDoc, null, 2),
  );
}
