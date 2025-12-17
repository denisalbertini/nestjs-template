import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.POSTGRES_CONNECTION_URI,
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
  }),
);
