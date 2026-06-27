import { CREDIT_CARD, ERROR_MESSAGES, USER } from '@constants';
import { Length, Matches } from 'class-validator';
import { IsNotExpiredMonthYear } from '../../../decorators/validation/is-not-expired-month-year';
import { IsValidLuhn } from '../../../decorators/validation/is-valid-luhn';

export class CreateCreditCardDto {
  @IsValidLuhn({ message: ERROR_MESSAGES.CREDIT_CARD.NUMBER })
  creditCardNumber!: string;

  @Matches(USER.NAME, {
    message: ERROR_MESSAGES.SHARED.LETTERS_ONLY('holderName'),
  })
  @Length(5, 100, { message: ERROR_MESSAGES.CREDIT_CARD.HOLDER_NAME })
  holderName!: string;

  @IsNotExpiredMonthYear({
    message: ERROR_MESSAGES.CREDIT_CARD.EXPIRATION_DATE,
  })
  expirationDate!: string;

  @Matches(CREDIT_CARD.CVV, { message: ERROR_MESSAGES.CREDIT_CARD.CVV })
  cvv!: string;
}
