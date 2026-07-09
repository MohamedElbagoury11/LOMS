import { Injectable, ParseUUIDPipe } from '@nestjs/common';

import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ParseUuidPipe extends ParseUUIDPipe {
  constructor() {
    super({
      exceptionFactory: () => new ValidationException('Invalid UUID', ['id must be a valid UUID']),
    });
  }
}
