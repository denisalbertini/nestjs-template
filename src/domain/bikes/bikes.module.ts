import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bike } from './entities/bike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bike])],
  exports: [TypeOrmModule],
})
export class BikesModule {}
