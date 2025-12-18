import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikersModule } from '../bikers/bikers.module';
import { BikesModule } from '../bikes/bikes.module';
import { DocksModule } from '../docks/docks.module';
import { Rental } from './entities/rental.entity';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental]),
    BikersModule,
    BikesModule,
    DocksModule,
  ],
  providers: [RentalsService],
  controllers: [RentalsController],
})
export class RentalsModule {}
