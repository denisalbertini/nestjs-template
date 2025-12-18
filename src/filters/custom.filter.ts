import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AbstractHttpAdapter } from '@nestjs/core';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

@Catch()
export class CustomFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomFilter.name);

  constructor(private readonly httpAdapter: AbstractHttpAdapter) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    this.reply(this.httpAdapter, ctx, this.mapException(exception));
  }

  private mapException(exception: unknown): HttpException {
    if (exception instanceof HttpException) {
      return exception;
    }

    if (exception instanceof TypeORMError) {
      return this.handleTypeORMError(exception);
    }

    return this.handleUnknownException(exception);
  }

  private handleUnknownException(exception: unknown): HttpException {
    let message = 'Unhandled exception: ';
    let stack: string | undefined = undefined;

    if (exception instanceof Error) {
      message += exception.constructor.name;
      stack = exception.stack;
    } else {
      message += typeof exception;
    }

    this.logger.error(message, stack);

    return new InternalServerErrorException('Refer to console');
  }

  private handleTypeORMError(exception: TypeORMError): HttpException {
    if (exception instanceof QueryFailedError) {
      const error = exception as any;

      switch (error.code) {
        case '23505': // PostgreSQL duplicate key
          const detail = error?.driverError?.detail;
          const match = detail?.match(/Chave \((.*?)\)=\((.*?)\)/);
          return new ConflictException(match[1]);

        case '23503': // PostgreSQL foreign key violation
          return new BadRequestException('Referenced resource does not exist');

        case '23502': // PostgreSQL not null violation
          return new BadRequestException('Required field cannot be null');

        default:
          return new UnprocessableEntityException('Database operation failed');
      }
    }

    if (exception instanceof EntityNotFoundError) {
      return new NotFoundException('Requested resource was not found');
    }

    return new InternalServerErrorException('Database error occurred');
  }

  private reply(
    httpAdapter: AbstractHttpAdapter,
    ctx: HttpArgumentsHost,
    exception: HttpException,
  ) {
    httpAdapter.reply(
      ctx.getResponse(),
      exception.getResponse(),
      exception.getStatus(),
    );
  }
}
