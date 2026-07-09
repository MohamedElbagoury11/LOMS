import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';

import { ErrorResponse } from '../dto/error-response.dto';

interface ExceptionResponseBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response<ErrorResponse>>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(exception, status);

    this.logger.error(
      `${request.method} ${request.url} failed with status ${String(status)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(responseBody);
  }

  private buildResponseBody(exception: unknown, status: HttpStatus): ErrorResponse {
    if (!(exception instanceof HttpException)) {
      return {
        success: false,
        message: 'Internal server error',
        errors: [],
      };
    }

    const exceptionResponse = exception.getResponse();
    const body = this.normalizeExceptionResponse(exceptionResponse);

    return {
      success: false,
      message: body.message,
      errors: status === HttpStatus.INTERNAL_SERVER_ERROR ? [] : body.errors,
    };
  }

  private normalizeExceptionResponse(exceptionResponse: string | object): {
    message: string;
    errors: string[];
  } {
    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        errors: [],
      };
    }

    const body = exceptionResponse as ExceptionResponseBody;
    const messages = Array.isArray(body.message)
      ? body.message
      : [body.message ?? body.error ?? 'Internal server error'];

    return {
      message: messages[0] ?? 'Internal server error',
      errors: messages,
    };
  }
}
