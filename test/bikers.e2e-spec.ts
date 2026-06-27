import { AppModule } from '@app-module';
import { AuthGuard } from '@auth/auth.guard';
import { AuthService } from '@auth/auth.service';
import { Biker } from '@bikers/entities/biker.entity';
import { BikerStatus } from '@bikers/enums/biker-status.enum';
import { configureApp } from '@config/app.config';
import { CreditCard } from '@credit-cards/entities/credit-card.entity';
import { EmailService } from '@email/email.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToPlain } from 'class-transformer';
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
      .overrideProvider(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(EmailService)
      .useValue({ sendAccountConfirmation: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
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

        const createBikerDto = buildCreateBikerDto();

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
              password: 'abc',
              confirmationPassword: 'def',
              creditCard: {
                creditCardNumber: '123',
                holderName: '123',
                expirationDate: '06/00',
                cvv: 'abc',
              },
            },
            expectedErrors: [
              'cpf is invalid',
              'name must have a length of 2 to 100 characters',
              'birthDate must represent an age between 12 and 100 years',
              'password must be longer than or equal to 6 characters',
              'confirmationPassword must match password',
              'creditCard.creditCardNumber is invalid',
              'creditCard.holderName must have a length of 5 to 100 characters',
              'creditCard.holderName must have only letters',
              'creditCard.expirationDate is expired',
              'creditCard.cvv is invalid',
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

        const createBikerDtoCpf = buildCreateBikerDto('95624749090');
        const createBikerDtoPassport = buildCreateBikerDto(undefined, true);

        const expectedCpfBikerData = {
          id: expect.any(String),
          cpf: createBikerDtoCpf.cpf,
          name: createBikerDtoCpf.name,
          birthDate: createBikerDtoCpf.birthDate.toISOString(),
          email: createBikerDtoCpf.email,
          password: expect.any(String),
          status: BikerStatus.PENDING,
          creditCard: {
            id: expect.any(String),
            creditCardNumber: createBikerDtoCpf.creditCard.creditCardNumber,
            holderName: createBikerDtoCpf.creditCard.holderName,
            expirationDate: createBikerDtoCpf.creditCard.expirationDate,
          },
        };

        const expectedPassportBikerData = {
          id: expect.any(String),
          cpf: null,
          name: createBikerDtoPassport.name,
          birthDate: createBikerDtoPassport.birthDate.toISOString(),
          email: createBikerDtoPassport.email,
          password: expect.any(String),
          status: BikerStatus.PENDING,
          creditCard: {
            id: expect.any(String),
            creditCardNumber:
              createBikerDtoPassport.creditCard.creditCardNumber,
            holderName: createBikerDtoPassport.creditCard.holderName,
            expirationDate: createBikerDtoPassport.creditCard.expirationDate,
          },
          passport: {
            id: expect.any(String),
            passportNumber: createBikerDtoPassport.passport?.passportNumber,
            countryCode: createBikerDtoPassport.passport?.countryCode,
            expirationDate:
              createBikerDtoPassport.passport?.expirationDate.toISOString(),
          },
        };

        const testCases = [
          {
            description: 'With CPF',
            reqBody: instanceToPlain(createBikerDtoCpf),
            expectedResBody: expectedCpfBikerData,
            expectedRecord: expect.objectContaining(expectedCpfBikerData),
          },
          {
            description: 'With passport',
            reqBody: instanceToPlain(createBikerDtoPassport),
            expectedResBody: expectedPassportBikerData,
            expectedRecord: expect.objectContaining(expectedPassportBikerData),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app.getHttpServer())
              [method](path)
              .send(reqBody);

            const record = await bikersRepository.findOne({
              where: { email: reqBody.email },
              relations: { creditCard: true },
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(instanceToPlain(record)).toStrictEqual(expectedRecord);
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
              password: 'abc',
              confirmationPassword: 'def',
              passport: {
                passportNumber: 'abc',
                expirationDate: '2000-06-15',
                countryCode: 'abc',
              },
            },
            expectedErrors: [
              'confirmationPassword must match password',
              'name must have a length of 2 to 100 characters',
              'birthDate must represent an age between 12 and 100 years',
              'password must be longer than or equal to 6 characters',
              'passport.passportNumber is invalid',
              'passport.countryCode is invalid',
              'passport.passport is expired',
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
        const {
          name,
          birthDate,
          email,
          password,
          confirmationPassword,
          passport,
        } = buildCreateBikerDto(undefined, true);

        const expectedUpdatedBikerData = {
          id: expect.any(String),
          cpf: null,
          name: name,
          birthDate: birthDate.toISOString(),
          email: email,
          password: expect.any(String),
          status: BikerStatus.ACTIVE,
          passport: {
            id: expect.any(String),
            passportNumber: passport?.passportNumber,
            countryCode: passport?.countryCode,
            expirationDate: passport?.expirationDate.toISOString(),
          },
        };

        const testCases = [
          {
            description: 'Full update',
            reqBody: {
              name,
              birthDate: birthDate.toISOString().split('T')[0],
              email: email,
              password: password,
              confirmationPassword: confirmationPassword,
              passport: passport,
            },
            expectedResBody: expectedUpdatedBikerData,
            expectedRecord: expect.objectContaining(expectedUpdatedBikerData),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app.getHttpServer())
              [method](path(bikerToUpdate.id))
              .set('Authorization', 'Bearer token')
              .send(reqBody);

            const record = await bikersRepository.findOneBy({ email });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);
            expect(instanceToPlain(record)).toStrictEqual(expectedRecord);
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

      describe('404', () => {
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
            error: 'Not Found',
            message: 'Requested resource was not found',
            statusCode: 404,
          });
          expect(res.status).toBe(404);
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
      biker.password = password;

      beforeAll(async () => {
        await truncateAllTables(dataSource);
        await creditCardsRepository.save(creditCard);
        await bikersRepository.save(biker);
      });

      describe('400', () => {
        const testCases = [
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
            message: 'Bad Request',
            statusCode: 400,
          });
          expect(res.status).toBe(400);
        });
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'Account does not exist',
            reqBody: { email: 'whatever@address.com', password },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app.getHttpServer())
            [method](path)
            .send(reqBody);

          expect(res.body).toStrictEqual({
            message: 'Not Found',
            statusCode: 404,
          });
          expect(res.status).toBe(404);
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
