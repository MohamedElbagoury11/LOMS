import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(message = 'Validation failed', errors: string[] = []) {
    super({
      message,
      errors,
    });
  }
}
