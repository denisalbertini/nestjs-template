import '@dotenvx/dotenvx/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_CONNECTION_URI,
  entities: ['dist/domain/**/*.entity.js'],
  migrations: ['src/migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
});
