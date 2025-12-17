import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Passport } from './entities/passport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Passport])],
  exports: [TypeOrmModule],
})
export class PassportsModule {}
