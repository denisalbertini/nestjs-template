import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dock } from './entities/dock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dock])],
  exports: [TypeOrmModule],
})
export class DocksModule {}
