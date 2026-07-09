import { registerAs } from '@nestjs/config';

export interface CorsConfig {
  enabled: boolean;
  origin: boolean | string[];
  credentials: boolean;
}

const parseCorsOrigin = (origin: string): boolean | string[] => {
  const origins = origin
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return origins.includes('*') ? true : origins;
};

export const corsConfig = registerAs(
  'cors',
  (): CorsConfig => ({
    enabled: process.env.CORS_ENABLED !== 'false',
    origin: parseCorsOrigin(process.env.CORS_ORIGIN ?? 'http://localhost:5173'),
    credentials: process.env.CORS_CREDENTIALS !== 'false',
  }),
);
