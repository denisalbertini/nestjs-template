import { ERROR_MESSAGES, PASSPORT } from '@constants';
import { TransformDate } from '@decorators/transformation/transform-date.decorator';
import { IsNotExpiredFullDate } from '@decorators/validation/is-not-expired-full-date';
import { Matches } from 'class-validator';

export class CreatePassportDto {
  @Matches(PASSPORT.NUMBER, { message: ERROR_MESSAGES.PASSPORT.NUMBER })
  passportNumber!: string;

  @Matches(PASSPORT.COUNTRY_CODE, {
    message: ERROR_MESSAGES.PASSPORT.COUNTRY_CODE,
  })
  countryCode!: string;

  @TransformDate()
  @IsNotExpiredFullDate({ message: ERROR_MESSAGES.PASSPORT.EXPIRATION_DATE })
  expirationDate!: Date;
}
