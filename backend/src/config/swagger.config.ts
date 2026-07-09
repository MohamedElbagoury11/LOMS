import { registerAs } from '@nestjs/config';

export interface SwaggerConfig {
  path: string;
}

export const swaggerConfig = registerAs(
  'swagger',
  (): SwaggerConfig => ({
    path: process.env.SWAGGER_PATH ?? 'docs',
  }),
);
