import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, errors: string[] = []) {
    super(
      {
        message,
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
