import { registerAs } from '@nestjs/config';

export interface AppConfig {
  appName: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    appName: process.env.APP_NAME ?? 'LOMS API',
    port: Number(process.env.APP_PORT ?? 3000),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    apiVersion: process.env.API_VERSION ?? '1',
  }),
);
