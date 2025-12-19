import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransformInstanceToPlain } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { APP } from 'src/constants';
import { EmailService } from 'src/email/email.service';
import { DataSource, Repository } from 'typeorm';
import { CreateCreditCardDto } from '../credit-cards/dto/create-credit-card.dto';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CreateBikerDto } from './dto/create-biker.dto';
import { UpdateBikerDto } from './dto/update-biker.dto';
import { Biker } from './entities/biker.entity';
import { BikerStatus } from './enums/biker-status.enum';

@Injectable()
export class BikersService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardsRepository: Repository<CreditCard>,
    @InjectRepository(Biker)
    private readonly bikersRepository: Repository<Biker>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @TransformInstanceToPlain()
  async create(createBikerDto: CreateBikerDto): Promise<Biker> {
    const biker = this.bikersRepository.create(createBikerDto);
    biker.papersPlease();

    const creditCard = this.creditCardsRepository.create(biker.creditCard);

    const existingCreditCard = await this.creditCardsRepository.findOneBy({
      creditCardNumber: creditCard.creditCardNumber,
    });

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        biker.creditCard =
          existingCreditCard ? existingCreditCard : (
            await transactionalEntityManager.save(creditCard)
          );

        const savedBiker = await transactionalEntityManager.save(biker);

        const emailToken = await this.authService.getEmailToken(savedBiker);

        await this.emailService.sendAccountConfirmation(
          savedBiker.id,
          savedBiker.email,
          emailToken,
          emailHtml,
          APP.NAME,
        );

        return savedBiker;
      },
    );
  }

  async activate(id: string, token: string): Promise<void> {
    await this.authService.verifyEmailToken(id, token);

    const biker = await this.bikersRepository.findOneOrFail({
      where: { id, status: BikerStatus.PENDING },
    });

    biker.status = BikerStatus.ACTIVE;

    await this.bikersRepository.save(biker);
  }

  @TransformInstanceToPlain()
  async update(id: string, updateBikerDto: UpdateBikerDto): Promise<Biker> {
    const biker = await this.bikersRepository.findOneByOrFail({ id });

    this.bikersRepository.merge(biker, updateBikerDto);

    return await this.bikersRepository.save(biker);
  }

  async changeCreditCard(
    id: string,
    createCreditCardDto: CreateCreditCardDto,
  ): Promise<void> {
    const biker = await this.bikersRepository.findOneByOrFail({ id });

    const creditCard = this.creditCardsRepository.create(createCreditCardDto);

    const existingCreditCard = await this.creditCardsRepository.findOneBy({
      creditCardNumber: creditCard.creditCardNumber,
    });

    biker.creditCard =
      existingCreditCard ? existingCreditCard : (
        await this.creditCardsRepository.save(creditCard)
      );

    await this.bikersRepository.save(biker);
  }
}

const emailHtml = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Confirmation</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 20px 0;
              background-color: #2c3e50;
              color: white;
              border-radius: 8px 8px 0 0;
          }
          .content {
              padding: 30px 20px;
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #3498db;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
          }
          .footer {
              text-align: center;
              padding: 20px;
              color: #7f8c8d;
              font-size: 12px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Docked Bike Sharing System</h1>
          </div>
          
          <div class="content">
              <h2>Account Confirmation</h2>
              <p>Hello,</p>
              <p>Thank you for creating a Bike Sharing App account!</p>
              <p>To activate your account click the button below:</p>
              
              <a href="{{confirmationUrl}}" class="button">Confirm</a>
              
              <p>For security reasons, this link will expire in the next 24 hours.</p>
          </div>
          
          <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
          </div>
      </div>
  </body>
  </html>
`;
