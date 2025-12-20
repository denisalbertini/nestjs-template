import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

export class EmailError extends Error {
  errors: Array<string>;

  constructor(message: string, ...errors: Array<string>) {
    super(message);
    this.name = 'EmailError';
    this.errors = errors;
  }
}

@Injectable()
export class EmailService {
  private readonly transporter;

  constructor(private configService: ConfigService) {
    try {
      this.transporter = createTransport({
        host: this.configService.get<string>('email.host'),
        port: this.configService.get<number>('email.port'),
        auth: {
          user: this.configService.get<string>('email.user'),
          pass: this.configService.get<string>('email.pass'),
        },
      });
    } catch (error) {
      throw new EmailError('Failed to create transporter.', error.message);
    }
  }

  async sendAccountConfirmation(
    userId: string,
    userEmail: string,
    token: string,
    html: string,
    from: string,
  ) {
    try {
      const confirmationUrl = `http://${this.configService.get<string>('DOMAIN')}:3000/api/bikers/${userId}/confirm?token=${token}`;

      const htmlWithUrl = html.replace(/{{confirmationUrl}}/g, confirmationUrl);

      const mailOptions = {
        from: `"${from}"`,
        to: userEmail,
        subject: 'Confirm Your User Account',
        html: htmlWithUrl,
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new EmailError(
        'Failed to send account confirmation email.',
        error.message,
      );
    }
  }
}
