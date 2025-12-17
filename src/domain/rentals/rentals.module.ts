import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikersModule } from '../bikers/bikers.module';
import { BikesModule } from '../bikes/bikes.module';
import { ChargesModule } from '../charges/charges.module';
import { DocksModule } from '../docks/docks.module';
import { Rental } from './entities/rental.entity';
import { RentalsService } from './rentals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental]),
    BikersModule,
    BikesModule,
    ChargesModule,
    DocksModule,
  ],
  providers: [RentalsService],
})
export class RentalsModule {}
