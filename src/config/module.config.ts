import { ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';
import emailConfig from './email.config';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  validationSchema: Joi.object({
    POSTGRES_CONNECTION_URI: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().port(),
    SMTP_USER: Joi.string().email().required(),
    SMTP_PASS: Joi.string().required(),
    DOMAIN: Joi.string().default('localhost'),
  }),
  load: [emailConfig],
};
