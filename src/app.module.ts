import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import emailConfig from './config/email.config';
import { BikersModule } from './domain/bikers/bikers.module';
import { BikesModule } from './domain/bikes/bikes.module';
import { ChargesModule } from './domain/charges/charges.module';
import { CreditCardsModule } from './domain/credit-cards/credit-cards.module';
import { DocksModule } from './domain/docks/docks.module';
import { PassportsModule } from './domain/passports/passports.module';
import { RentalsModule } from './domain/rentals/rentals.module';
import { StationsModule } from './domain/stations/stations.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        POSTGRES_CONNECTION_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().port(),
        SMTP_USER: Joi.string().email().required(),
        SMTP_PASS: Joi.string().required(),
        DOMAIN: Joi.string(),
      }),
      load: [databaseConfig, emailConfig],
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    CreditCardsModule,
    BikersModule,
    PassportsModule,
    AuthModule,
    EmailModule,
    BikesModule,
    ChargesModule,
    DocksModule,
    RentalsModule,
    StationsModule,
  ],
  providers: [],
})
export class AppModule {}
