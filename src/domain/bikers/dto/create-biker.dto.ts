import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  Length,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ERROR_MESSAGES, USER } from 'src/constants';
import { TransformDate } from 'src/decorators/transformation/transform-date.decorator';
import { IsCpf } from 'src/decorators/validation/is-cpf';
import { IsValidBirthDate } from 'src/decorators/validation/is-valid-birth-date';
import { MatchPropertyValue } from 'src/decorators/validation/match-property-value';
import { CreateCreditCardDto } from 'src/domain/credit-cards/dto/create-credit-card.dto';
import { CreatePassportDto } from 'src/domain/passports/dto/create-passport.dto';

export class CreateBikerDto {
  @ValidateIf((o) => !o.passport)
  @IsCpf()
  cpf?: string;

  @Transform(({ value }) => value.trim())
  @Matches(USER.NAME, { message: ERROR_MESSAGES.SHARED.LETTERS_ONLY('name') })
  @Length(2, 100, { message: ERROR_MESSAGES.BIKER.NAME })
  name: string;

  @TransformDate()
  @IsValidBirthDate(12, 100)
  birthDate: Date;

  @IsEmail()
  email: string;

  @Length(6, 50)
  password: string;

  @MatchPropertyValue('password')
  confirmationPassword: string;

  @ValidateNested()
  @Type(() => CreateCreditCardDto)
  creditCard: CreateCreditCardDto;

  @ValidateIf((o) => !o.cpf)
  @ValidateNested()
  @Type(() => CreatePassportDto)
  passport?: CreatePassportDto;
}
