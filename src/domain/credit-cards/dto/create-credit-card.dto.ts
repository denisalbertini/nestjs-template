import { ApiProperty } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';
import { CREDIT_CARD, ERROR_MESSAGES, USER } from 'src/constants';
import { IsNotExpiredMonthYear } from '../../../custom-validation-decorators/is-not-expired-month-year';
import { IsValidLuhn } from '../../../custom-validation-decorators/is-valid-luhn';

export class CreateCreditCardDto {
  @IsValidLuhn({ message: ERROR_MESSAGES.CREDIT_CARD.NUMBER })
  creditCardNumber: string;

  @ApiProperty()
  @Matches(USER.NAME, {
    message: ERROR_MESSAGES.SHARED.LETTERS_ONLY('holderName'),
  })
  @Length(5, 100, { message: ERROR_MESSAGES.CREDIT_CARD.HOLDER_NAME })
  holderName: string;

  @IsNotExpiredMonthYear({
    message: ERROR_MESSAGES.CREDIT_CARD.EXPIRATION_DATE,
  })
  expirationDate: string;

  @ApiProperty()
  @Matches(CREDIT_CARD.CVV, { message: ERROR_MESSAGES.CREDIT_CARD.CVV })
  cvv: string;
}
