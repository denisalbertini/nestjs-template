import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmModuleOptions } from './config/database.config';
import { configModuleOptions } from './config/module.config';
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
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    EmailModule,
    BikersModule,
    BikesModule,
    ChargesModule,
    CreditCardsModule,
    DocksModule,
    PassportsModule,
    AuthModule,
    RentalsModule,
    StationsModule,
  ],
  providers: [],
})
export class AppModule {}
