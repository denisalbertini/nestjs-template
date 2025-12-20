import '@dotenvx/dotenvx/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_CONNECTION_URI,
  entities: ['dist/domain/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
};

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: dataSourceOptions.type,
  url: dataSourceOptions.url,
  namingStrategy: dataSourceOptions.namingStrategy,
  migrations: dataSourceOptions.migrations,
  migrationsRun: true,
  autoLoadEntities: true,
};

export const dataSource = new DataSource(dataSourceOptions);
