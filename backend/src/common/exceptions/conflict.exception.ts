import { ConflictException as NestConflictException } from '@nestjs/common';

export class ConflictException extends NestConflictException {
  constructor(message = 'Resource conflict', errors: string[] = []) {
    super({
      message,
      errors,
    });
  }
}
