import { AuthModule } from '@auth/auth.module';
import { BikersModule } from '@bikers/bikers.module';
import { BikesModule } from '@bikes/bikes.module';
import { ChargesModule } from '@charges/charges.module';
import { typeOrmModuleOptions } from '@config/database.config';
import { configModuleOptions } from '@config/module.config';
import { CreditCardsModule } from '@credit-cards/credit-cards.module';
import { DocksModule } from '@docks/docks.module';
import { EmailModule } from '@email/email.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportsModule } from '@passports/passports.module';
import { RentalsModule } from '@rentals/rentals.module';
import { StationsModule } from '@stations/stations.module';

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
