import { faker } from '@faker-js/faker';
import RandExp from 'randexp';
import { CreateBikerDto } from 'src/domain/bikers/dto/create-biker.dto';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
import { BikerStatus } from 'src/domain/bikers/enums/biker-status.enum';
import { CreateCreditCardDto } from 'src/domain/credit-cards/dto/create-credit-card.dto';
import { CreditCard } from 'src/domain/credit-cards/entities/credit-card.entity';
import { CreatePassportDto } from 'src/domain/passports/dto/create-passport.dto';
import { Passport } from 'src/domain/passports/entities/passport.entity';

export function buildCreateCreditCardDto(): CreateCreditCardDto {
  return {
    creditCardNumber: faker.finance.creditCardNumber(),
    holderName: faker.person.fullName(),
    expirationDate: '06/77',
    cvv: faker.finance.creditCardCVV(),
  };
}

type CreditCardBody = Omit<CreditCard, 'bikers'>;

export function buildCreditCard(): CreditCardBody {
  return {
    id: faker.string.uuid(),
    creditCardNumber: faker.finance.creditCardNumber(),
    holderName: faker.person.fullName(),
    expirationDate: '06/77',
  };
}

type CreateBikerDtoBody = Omit<CreateBikerDto, 'birthDate' | 'passport'> & {
  birthDate: string;
  passport?: CreatePassportDtoBody;
};

export function buildCreateBikerDto(
  creditCard: CreateCreditCardDto,
  cpf?: string,
  passport?: boolean,
): CreateBikerDtoBody {
  const pass = faker.internet.password();

  return {
    name: faker.person.fullName(),
    birthDate: '2000-06-15',
    email: faker.internet.email(),
    password: pass,
    confirmationPassword: pass,
    creditCard,
    ...(cpf && { cpf }),
    ...(passport && { passport: buildCreatePassportDto() }),
  };
}

type BikerBody = Omit<
  Biker,
  'creditCard' | 'passport' | 'hashPassword' | 'papersPlease'
> & { creditCard: CreditCardBody; passport?: PassportBody };

export function buildBiker(
  creditCard: CreditCardBody,
  cpf?: string,
  passport?: boolean,
): BikerBody {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    birthDate: new Date('2000-06-15'),
    email: faker.internet.email(),
    password: RandExp.randexp(/\$2[aby]\$10\$[./A-Za-z0-9]{53}/),
    status: BikerStatus.ACTIVE,
    creditCard,
    ...(cpf && { cpf }),
    ...(passport && { passport: buildPassport() }),
  };
}

type CreatePassportDtoBody = Omit<CreatePassportDto, 'expirationDate'> & {
  expirationDate: string;
};

export function buildCreatePassportDto(): CreatePassportDtoBody {
  return {
    passportNumber: RandExp.randexp(/[A-Za-z0-9]{6,9}/),
    countryCode: RandExp.randexp(/[A-Z]{3}/),
    expirationDate: '2077-06-15',
  };
}

function buildUpdatePassportDto() {
  return buildCreatePassportDto();
}

type PassportBody = Omit<Passport, 'biker'>;

export function buildPassport(): PassportBody {
  return {
    id: faker.string.uuid(),
    passportNumber: RandExp.randexp(/[A-Za-z0-9]{6,9}/),
    countryCode: RandExp.randexp(/[A-Z]{3}/),
    expirationDate: new Date('2077-06-15'),
  };
}
