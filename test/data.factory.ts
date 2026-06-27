import { CreateBikerDto } from '@bikers/dto/create-biker.dto';
import { Biker } from '@bikers/entities/biker.entity';
import { BikerStatus } from '@bikers/enums/biker-status.enum';
import { CreateCreditCardDto } from '@credit-cards/dto/create-credit-card.dto';
import { CreditCard } from '@credit-cards/entities/credit-card.entity';
import { faker } from '@faker-js/faker';
import { CreatePassportDto } from '@passports/dto/create-passport.dto';
import { Passport } from '@passports/entities/passport.entity';
import RandExp from 'randexp';

export function buildCreateCreditCardDto(): CreateCreditCardDto {
  const createCreditCardDto = new CreateCreditCardDto();

  createCreditCardDto.creditCardNumber = faker.finance.creditCardNumber();
  createCreditCardDto.holderName = faker.person.fullName();
  createCreditCardDto.expirationDate = '06/77';
  createCreditCardDto.cvv = faker.finance.creditCardCVV();

  return createCreditCardDto;
}

export function buildCreditCard(): CreditCard {
  const creditCard = new CreditCard();

  creditCard.id = faker.string.uuid();
  creditCard.creditCardNumber = faker.finance.creditCardNumber();
  creditCard.holderName = faker.person.fullName();
  creditCard.expirationDate = '06/77';

  return creditCard;
}

export function buildCreatePassportDto(): CreatePassportDto {
  const createPassportDto = new CreatePassportDto();

  createPassportDto.passportNumber = RandExp.randexp(/[A-Za-z0-9]{6,9}/);
  createPassportDto.countryCode = RandExp.randexp(/[A-Z]{3}/);
  createPassportDto.expirationDate = new Date('2077-06-15');

  return createPassportDto;
}

export function buildPassport(): Passport {
  const passport = new Passport();

  passport.id = faker.string.uuid();
  passport.passportNumber = RandExp.randexp(/[A-Za-z0-9]{6,9}/);
  passport.countryCode = RandExp.randexp(/[A-Z]{3}/);
  passport.expirationDate = new Date('2077-06-15');

  return passport;
}

export function buildCreateBikerDto(
  cpf?: string,
  passport?: boolean,
): CreateBikerDto {
  const createBikerDto = new CreateBikerDto();

  createBikerDto.name = faker.person.fullName();
  createBikerDto.birthDate = new Date('2000-06-15');
  createBikerDto.email = faker.internet.email();
  createBikerDto.password = faker.internet.password();
  createBikerDto.confirmationPassword = createBikerDto.password;
  createBikerDto.creditCard = buildCreateCreditCardDto();

  if (cpf) {
    createBikerDto.cpf = cpf;
  } else if (passport) {
    createBikerDto.passport = buildCreatePassportDto();
  }

  return createBikerDto;
}

export function buildBiker(
  creditCard: CreditCard,
  cpf?: string,
  passport?: boolean,
): Biker {
  const biker = new Biker();

  biker.id = faker.string.uuid();
  biker.name = faker.person.fullName();
  biker.birthDate = new Date('2000-06-15');
  biker.email = faker.internet.email();
  biker.password = RandExp.randexp(/\$2[aby]\$10\$[./A-Za-z0-9]{53}/);
  biker.status = BikerStatus.ACTIVE;
  biker.creditCard = creditCard;

  if (cpf) {
    biker.cpf = cpf;
  } else if (passport) {
    biker.passport = buildPassport();
  }

  return biker;
}
