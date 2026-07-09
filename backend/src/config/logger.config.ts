import { registerAs } from '@nestjs/config';

import { NodeEnvironment } from '../common/enums/node-environment.enum';

export interface LoggerConfig {
  environment: NodeEnvironment;
}

export const loggerConfig = registerAs(
  'logger',
  (): LoggerConfig => ({
    environment: (process.env.NODE_ENV ?? NodeEnvironment.Development) as NodeEnvironment,
  }),
);
