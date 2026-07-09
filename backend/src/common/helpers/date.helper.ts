export class DateHelper {
  static now(): Date {
    return new Date();
  }

  static toIsoString(date: Date): string {
    return date.toISOString();
  }

  static addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
  }

  static startOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    return start;
  }

  static endOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return end;
  }
}
