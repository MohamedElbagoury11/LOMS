import { randomUUID } from 'crypto';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UuidHelper {
  static generate(): string {
    return randomUUID();
  }

  static isValid(value: string): boolean {
    return UUID_PATTERN.test(value);
  }

  static normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
