import { BikersModule } from '@bikers/bikers.module';
import { BikesModule } from '@bikes/bikes.module';
import { ChargesModule } from '@charges/charges.module';
import { DocksModule } from '@docks/docks.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from './entities/rental.entity';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental]),
    BikersModule,
    BikesModule,
    DocksModule,
    ChargesModule,
  ],
  providers: [RentalsService],
  controllers: [RentalsController],
})
export class RentalsModule {}
