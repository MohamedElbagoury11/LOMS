import { NotFoundException as NestNotFoundException } from '@nestjs/common';

export class NotFoundException extends NestNotFoundException {
  constructor(message = 'Resource not found', errors: string[] = []) {
    super({
      message,
      errors,
    });
  }
}
