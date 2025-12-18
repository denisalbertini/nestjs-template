import { Matches } from 'class-validator';
import { ERROR_MESSAGES, PASSPORT } from 'src/constants';
import { TransformDate } from 'src/decorators/transformation/transform-date.decorator';
import { IsNotExpiredFullDate } from 'src/decorators/validation/is-not-expired-full-date';

export class CreatePassportDto {
  @Matches(PASSPORT.NUMBER, { message: ERROR_MESSAGES.PASSPORT.NUMBER })
  passportNumber: string;

  @Matches(PASSPORT.COUNTRY_CODE, {
    message: ERROR_MESSAGES.PASSPORT.COUNTRY_CODE,
  })
  countryCode: string;

  @TransformDate()
  @IsNotExpiredFullDate({ message: ERROR_MESSAGES.PASSPORT.EXPIRATION_DATE })
  expirationDate: Date;
}
