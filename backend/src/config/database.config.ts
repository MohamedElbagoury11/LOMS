import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'loms',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'loms',
    logging: process.env.DB_LOGGING === 'true',
  }),
);
