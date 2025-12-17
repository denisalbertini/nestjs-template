import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';
import { CreditCardsModule } from '../credit-cards/credit-cards.module';
import { PassportsModule } from '../passports/passports.module';
import { BikersController } from './bikers.controller';
import { BikersService } from './bikers.service';
import { Biker } from './entities/biker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Biker]),
    CreditCardsModule,
    PassportsModule,
    forwardRef(() => AuthModule),
    EmailModule,
  ],
  providers: [BikersService],
  controllers: [BikersController],
  exports: [TypeOrmModule],
})
export class BikersModule {}
