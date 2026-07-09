import { ConfigService } from '@nestjs/config';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';

import { NodeEnvironment } from '../../common/enums/node-environment.enum';
import { LoggerConfig } from '../../config/logger.config';

export const createWinstonLoggerOptions = (configService: ConfigService): WinstonModuleOptions => {
  const logger = configService.getOrThrow<LoggerConfig>('logger');
  const isProduction = logger.environment === NodeEnvironment.Production;

  return {
    level: isProduction ? 'info' : 'debug',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          isProduction
            ? winston.format.json()
            : nestWinstonModuleUtilities.format.nestLike('LOMS', {
                colors: true,
                prettyPrint: true,
              }),
        ),
      }),
    ],
  };
};
