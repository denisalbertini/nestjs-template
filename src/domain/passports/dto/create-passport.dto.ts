import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Matches } from 'class-validator';
import { ERROR_MESSAGES, PASSPORT } from 'src/constants';
import { IsNotExpiredFullDate } from 'src/custom-validation-decorators/is-not-expired-full-date';

export class CreatePassportDto {
  @ApiProperty()
  @Matches(PASSPORT.NUMBER, { message: ERROR_MESSAGES.PASSPORT.NUMBER })
  passportNumber: string;

  @ApiProperty()
  @Matches(PASSPORT.COUNTRY_CODE, {
    message: ERROR_MESSAGES.PASSPORT.COUNTRY_CODE,
  })
  countryCode: string;

  @ApiProperty({ type: 'string', format: 'date' })
  @IsNotExpiredFullDate({ message: ERROR_MESSAGES.PASSPORT.EXPIRATION_DATE })
  @Type(() => Date)
  expirationDate: Date;
}
