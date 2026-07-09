export class StringHelper {
  static trim(value: string): string {
    return value.trim();
  }

  static trimToNull(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  static normalizeWhitespace(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  static toLowerCase(value: string): string {
    return value.toLowerCase();
  }
}
