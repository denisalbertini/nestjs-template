import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { AppModule } from 'src/app.module';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { configureApp } from 'src/config/app.config';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
import { BikerStatus } from 'src/domain/bikers/enums/biker-status.enum';
import { CreditCard } from 'src/domain/credit-cards/entities/credit-card.entity';
import { EmailService } from 'src/email/email.service';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import {
  buildBiker,
  buildCreateBikerDto,
  buildCreateCreditCardDto,
  buildCreatePassportDto,
  buildCreditCard,
} from './data.factory';
import { truncateAllTables } from './truncate-tables';

describe('Bikers (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let creditCardsRepository: Repository<CreditCard>;
  let bikersRepository: Repository<Biker>;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(EmailService)
      .useValue({ sendAccountConfirmation: () => true })
      .compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    configureApp(app, false);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    creditCardsRepository = dataSource.getRepository(CreditCard);
    bikersRepository = dataSource.getRepository(Biker);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/', () => {
    const path = '/api/bikers';

    describe('POST', () => {
      const method = 'post';

      describe('409', () => {
        const creditCard = buildCreditCard();
        const bikerWithCpf = buildBiker(creditCard, '85389004043');
        const bikerWithPassport = buildBiker(creditCard, undefined, true);

        beforeAll(async () => {
          await truncateAllTables(dataSource);
          await creditCardsRepository.save(creditCard);
          await bikersRepository.save([bikerWithCpf, bikerWithPassport]);
        });

        const createBikerDto = buildCreateBikerDto(buildCreateCreditCardDto());

        const testCases = [
          {
            description: 'Conflicting CPF',
            reqBody: { ...createBikerDto, cpf: bikerWithCpf.cpf },
            constraint: 'cpf',
          },
          {
            description: 'Conflicting email',
            reqBody: {
              ...createBikerDto,
              cpf: '70854845003',
              email: bikerWithCpf.email,
            },
            constraint: 'email',
          },
          {
            description: 'Conflicting passport',
            reqBody: {
              ...createBikerDto,
              passport: {
                ...buildCreatePassportDto(),
                passportNumber: bikerWithPassport?.passport?.passportNumber,
              },
            },
            constraint: 'passport_number',
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, constraint }) => {
            const res = await request(app.getHttpServer())
              [method](path)
              .send(reqBody);

            expect(res.body).toStrictEqual({
              error: 'Conflict',
              message: constraint,
              statusCode: 409,
            });
            expect(res.status).toBe(409);
          },
        );
      });

      describe('400', () => {
        beforeAll(() => truncateAllTables(dataSource));

        const testCases = [
          {
            description: 'Invalid data values',
            reqBody: {
              cpf: 'abc',
              name: 'a',
              birthDate: '2077-06-15',
              email: 'test@address.com',
              password: 'abcdef',
              confirmationPassword: 'defabc',
              creditCard: {
                creditCardNumber: '123',
                holderName: '123',
                expirationDate: '06/00',
                cvv: 'abc',
              },
            },
            expectedErrors: [
              'CPF is invalid',
              'name must be longer than or equal to 2 characters',
              'Birth date must represent an age between 12 and 100 years',
              'confirmationPassword must match password',
              'creditCard.Credit card number is invalid',
              "creditCard.holderName must match /^[\\p{L}\\s'.-]+$/u regular expression",
              'creditCard.Credit card is expired',
              'creditCard.cvv must match /^\\d{3,4}$/ regular expression',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app.getHttpServer())
              [method](path)
              .send(reqBody);

            expect(res.body).toStrictEqual({
              error: 'Bad Request',
              message: expectedErrors,
              statusCode: 400,
            });
            expect(res.status).toBe(400);
            expect(await creditCardsRepository.count()).toBe(0);
            expect(await bikersRepository.count()).toBe(0);
          },
        );
      });

      describe('200', () => {
        beforeEach(() => truncateAllTables(dataSource));

        const createCreditCardDto = buildCreateCreditCardDto();
        const createBikerDtoCpf = buildCreateBikerDto(
          createCreditCardDto,
          '30535151055',
        );
        const createBikerDtoPassport = buildCreateBikerDto(
          createCreditCardDto,
          undefined,
          true,
        );

        const creditCard = {
          id: expect.any(String),
          creditCardNumber: createCreditCardDto.creditCardNumber,
          holderName: createCreditCardDto.holderName,
          expirationDate: createCreditCardDto.expirationDate,
        };
        const bikerWithCpf = {
          id: expect.any(String),
          cpf: createBikerDtoCpf.cpf,
          name: createBikerDtoCpf.name,
          birthDate: new Date(createBikerDtoCpf.birthDate).toISOString(),
          email: createBikerDtoCpf.email,
          password: expect.any(String),
          status: BikerStatus.PENDING,
          creditCard,
        };
        const bikerWithPassport = {
          id: expect.any(String),
          cpf: null,
          name: createBikerDtoPassport.name,
          birthDate: new Date(createBikerDtoPassport.birthDate).toISOString(),
          email: createBikerDtoPassport.email,
          password: expect.any(String),
          status: BikerStatus.PENDING,
          creditCard,
          passport: {
            ...createBikerDtoPassport.passport,
            id: expect.any(String),
            expirationDate: new Date(
              createBikerDtoPassport.passport?.expirationDate ?? '',
            ).toISOString(),
          },
        };

        const testCases = [
          {
            description: 'With CPF',
            reqBody: createBikerDtoCpf,
            expectedResBody: bikerWithCpf,
            expectedRecord: {
              ...bikerWithCpf,
              birthDate: new Date(createBikerDtoCpf.birthDate),
              passport: null,
            },
          },
          {
            description: 'With passport',
            reqBody: createBikerDtoPassport,
            expectedResBody: bikerWithPassport,
            expectedRecord: {
              ...bikerWithPassport,
              birthDate: new Date(bikerWithPassport.birthDate),
              passport: {
                ...bikerWithPassport.passport,
                expirationDate: new Date(
                  createBikerDtoPassport.passport?.expirationDate ?? '',
                ),
              },
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app.getHttpServer())
              [method](path)
              .send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(
              await bikersRepository.findOne({
                where: { email: reqBody.email },
                relations: ['creditCard'],
              }),
            ).toStrictEqual(expect.objectContaining(expectedRecord));
          },
        );
      });
    });
  });

  describe('/:id', () => {
    const path = (id: string) => `/api/bikers/${id}`;

    describe('PATCH', () => {
      const method = 'patch';

      const creditCard = buildCreditCard();
      const conflictingBiker = buildBiker(creditCard, undefined, true);
      const bikerToUpdate = buildBiker(creditCard, undefined, true);
      bikerToUpdate.id = 'd62e41fb-3e9b-41fc-96ac-17eeb346ffac';

      beforeAll(async () => {
        await truncateAllTables(dataSource);
        await creditCardsRepository.save(creditCard);
        await bikersRepository.save([conflictingBiker, bikerToUpdate]);
      });

      describe('409', () => {
        const testCases = [
          {
            description: 'Conflicting email',
            reqBody: { email: conflictingBiker.email },
            constraint: 'email',
          },
          {
            description: 'Conflicting passport',
            reqBody: {
              passport: {
                ...buildCreatePassportDto(),
                passportNumber: conflictingBiker?.passport?.passportNumber,
              },
            },
            constraint: 'passport_number',
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, constraint }) => {
            const res = await request(app.getHttpServer())
              [method](path(bikerToUpdate.id))
              .set('Authorization', 'Bearer token')
              .send(reqBody);

            expect(res.body).toStrictEqual({
              error: 'Conflict',
              message: constraint,
              statusCode: 409,
            });
            expect(res.status).toBe(409);
          },
        );
      });

      describe('400', () => {
        const testCases = [
          {
            description: 'Invalid data values',
            reqBody: {
              name: 'a',
              birthDate: '2077-06-15',
              password: 'abcdef',
              confirmationPassword: 'defabc',
              passport: {
                passportNumber: 'abc',
                expirationDate: '2000-06-15',
                countryCode: 'abc',
              },
            },
            expectedErrors: [
              'confirmationPassword must match password',
              'name must be longer than or equal to 2 characters',
              'Birth date must represent an age between 12 and 100 years',
              'passport.passportNumber must match /^[A-Za-z0-9]{6,9}$/ regular expression',
              'passport.countryCode must match /\\b[A-Z]{3}\\b/ regular expression',
              'passport.Passport is expired',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app.getHttpServer())
              [method](path(bikerToUpdate.id))
              .set('Authorization', 'Bearer token')
              .send(reqBody);

            expect(res.body).toStrictEqual({
              error: 'Bad Request',
              message: expectedErrors,
              statusCode: 400,
            });
            expect(res.status).toBe(400);
          },
        );
      });

      describe('200', () => {
        const biker = buildCreateBikerDto(
          buildCreateCreditCardDto(),
          undefined,
          true,
        );

        const updatedBiker = {
          id: expect.any(String),
          cpf: null,
          name: biker.name,
          birthDate: new Date(biker.birthDate).toISOString(),
          email: biker.email,
          password: expect.any(String),
          status: BikerStatus.ACTIVE,
          passport: {
            id: expect.any(String),
            ...biker.passport,
            expirationDate: new Date(
              biker.passport?.expirationDate ?? '',
            ).toISOString(),
          },
        };

        const testCases = [
          {
            description: 'Full update',
            reqBody: {
              name: biker.name,
              birthDate: biker.birthDate,
              email: biker.email,
              password: biker.password,
              confirmationPassword: biker.confirmationPassword,
              passport: biker.passport,
            },
            expectedResBody: updatedBiker,
            expectedRecord: {
              ...updatedBiker,
              birthDate: new Date(biker.birthDate),
              passport: {
                id: expect.any(String),
                ...biker.passport,
                expirationDate: new Date(biker.passport?.expirationDate ?? ''),
                biker: undefined,
              },
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app.getHttpServer())
              [method](path(bikerToUpdate.id))
              .set('Authorization', 'Bearer token')
              .send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);
            expect(
              await bikersRepository.findOneBy({ email: biker.email }),
            ).toStrictEqual(expect.objectContaining(expectedRecord));
          },
        );
      });
    });
  });

  describe('/:id/confirm', () => {
    const path = (id: string, token: string) =>
      `/api/bikers/${id}/confirm?token=${token}`;

    describe('GET', () => {
      const method = 'get';

      describe('412', () => {
        const creditCard = buildCreditCard();
        const biker = buildBiker(creditCard);

        beforeAll(async () => {
          await truncateAllTables(dataSource);
          await creditCardsRepository.save(creditCard);
          await bikersRepository.save(biker);
        });

        const testCases = [{ description: 'ACTIVE status' }];

        test.each(testCases)('$description', async () => {
          const token = await authService.getEmailToken(
            (await bikersRepository.findOneBy({ email: biker.email })) ??
              new Biker(),
          );

          const res = await request(app.getHttpServer())
            [method](path(biker.id, token))
            .send();

          expect(res.body).toStrictEqual({
            message: 'Precondition Failed',
            statusCode: 412,
          });
          expect(res.status).toBe(412);
        });
      });

      describe('401', () => {
        const creditCard = buildCreditCard();
        const biker = buildBiker(creditCard);

        beforeAll(async () => {
          await truncateAllTables(dataSource);
          await creditCardsRepository.save(creditCard);
          await bikersRepository.save(biker);
        });

        const testCases = [{ description: 'Invalid query id' }];

        test.each(testCases)('$description', async () => {
          const token = await authService.getEmailToken(
            (await bikersRepository.findOneBy({ email: biker.email })) ??
              new Biker(),
          );

          const res = await request(app.getHttpServer())
            [method](path('abc', token))
            .send();

          expect(res.body).toStrictEqual({
            message: 'Unauthorized',
            statusCode: 401,
          });
          expect(res.status).toBe(401);
        });
      });

      describe('204', () => {
        const creditCard = buildCreditCard();
        const biker = buildBiker(creditCard);
        biker.status = BikerStatus.PENDING;

        beforeAll(async () => {
          await truncateAllTables(dataSource);
          await creditCardsRepository.save(creditCard);
          await bikersRepository.save(biker);
        });

        const testCases = [{ description: 'Account activated' }];

        test.each(testCases)('$description', async () => {
          const token = await authService.getEmailToken(
            (await bikersRepository.findOneBy({ email: biker.email })) ??
              new Biker(),
          );

          const res = await request(app.getHttpServer())
            [method](path(biker.id, token))
            .send();

          expect(res.body).toStrictEqual({});
          expect(res.status).toBe(204);
          expect(
            (await bikersRepository.findOneBy({ email: biker.email }))?.status,
          ).toBe(BikerStatus.ACTIVE);
        });
      });
    });
  });

  describe('/:id/credit-cards', () => {
    const path = (id: string) => `/api/bikers/${id}/credit-cards`;

    describe('POST', () => {
      const method = 'post';

      describe('204', () => {
        const existingCreditCard = buildCreditCard();
        const creditCard = buildCreditCard();
        const biker = buildBiker(creditCard);

        beforeAll(async () => {
          await truncateAllTables(dataSource);
          await creditCardsRepository.save([existingCreditCard, creditCard]);
          await bikersRepository.save(biker);
        });

        const newCreditCard = buildCreateCreditCardDto();

        const testCases = [
          {
            description: 'Existing credit card',
            reqBody: {
              creditCardNumber: existingCreditCard.creditCardNumber,
              holderName: existingCreditCard.holderName,
              expirationDate: existingCreditCard.expirationDate,
              cvv: '123',
            },
            expectedRecord: expect.objectContaining({
              id: biker.id,
              creditCard: expect.objectContaining({
                creditCardNumber: existingCreditCard.creditCardNumber,
              }),
            }),
          },
          {
            description: 'New credit card',
            reqBody: newCreditCard,
            expectedRecord: expect.objectContaining({
              id: biker.id,
              creditCard: expect.objectContaining({
                creditCardNumber: newCreditCard.creditCardNumber,
              }),
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedRecord }) => {
            const res = await request(app.getHttpServer())
              [method](path(biker.id))
              .set('Authorization', 'Bearer token')
              .send(reqBody);

            expect(res.body).toStrictEqual({});
            expect(res.status).toBe(204);
            expect(
              await bikersRepository.findOne({
                where: { email: biker.email },
                relations: ['creditCard'],
              }),
            ).toStrictEqual(expectedRecord);
          },
        );
      });
    });
  });

  describe('/login', () => {
    const path = '/api/auth/login';

    describe('POST', () => {
      const method = 'post';

      const creditCard = buildCreditCard();
      const biker = buildBiker(creditCard);

      const password = 'secret';
      biker.password = bcrypt.hashSync(password, 10);

      beforeAll(async () => {
        await truncateAllTables(dataSource);
        await creditCardsRepository.save(creditCard);
        await bikersRepository.save(biker);
      });

      describe('401', () => {
        const testCases = [
          {
            description: 'Account does not exist',
            reqBody: { email: 'whatever@address.com', password: 'abcdef' },
          },
          {
            description: 'Password does not match',
            reqBody: { email: biker.email, password: 'abcdef' },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app.getHttpServer())
            [method](path)
            .send(reqBody);

          expect(res.body).toStrictEqual({
            message: 'Unauthorized',
            statusCode: 401,
          });
          expect(res.status).toBe(401);
        });
      });

      describe('200', () => {
        const testCases = [
          {
            description: 'Successfull login',
            reqBody: { email: biker.email, password },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app.getHttpServer())
            [method](path)
            .send(reqBody);

          expect(res.body).toStrictEqual({ token: expect.any(String) });
          expect(res.status).toBe(200);
        });
      });
    });
  });
});
