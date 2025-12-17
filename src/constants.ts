export const CREDIT_CARD = { CVV: /^\d{3,4}$/ } as const;

export const USER = {
  NAME: /^[\p{L}\s'.-]+$/u,
  PASSWORD: /\$2[aby]\$10\$[./A-Za-z0-9]{53}/,
} as const;

export const PASSPORT = {
  NUMBER: /^[A-Za-z0-9]{6,9}$/,
  COUNTRY_CODE: /\b[A-Z]{3}\b/,
} as const;

export const DECORATOR_KEY = { IS_PUBLIC: 'IS_PUBLIC_KEY' } as const;

export const APP = { NAME: 'Bike Sharing App' } as const;

export const ERROR_MESSAGES = {
  SHARED: {
    LETTERS_ONLY: (property: string) => `${property} must have only letters`,
    MATCH_PROPERTY_VALUE: (property1: string, property2: string) =>
      `${property1} must match ${property2}`,
    NOT_FOUND: (entity: string) => `${entity} not found`,
    INVALID_STATUS: (entity: string) => `${entity} has an invalid status`,
  },
  CREDIT_CARD: {
    NUMBER: 'creditCardNumber is invalid',
    HOLDER_NAME: 'holderName must have a length of 5 to 100 characters',
    EXPIRATION_DATE: 'expirationDate is expired',
    CVV: 'cvv is invalid',
  },
  BIKER: {
    CPF: 'cpf is invalid',
    NAME: 'name must have a length of 2 to 100 characters',
    BIRTH_DATE: 'birthDate must characterize an age of 12 to 100 years',
    RENTING: 'Biker is already renting',
  },
  PASSPORT: {
    NUMBER: 'passportNumber is invalid',
    COUNTRY_CODE: 'countryCode is invalid',
    EXPIRATION_DATE: 'passport is expired',
  },
} as const;
