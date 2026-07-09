import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { GlobalResponseInterceptor } from './common/interceptors/global-response.interceptor';
import { appConfig } from './config/app.config';
import { corsConfig } from './config/cors.config';
import { databaseConfig } from './config/database.config';
import { environmentValidationSchema } from './config/environment.validation';
import { loggerConfig } from './config/logger.config';
import { swaggerConfig } from './config/swagger.config';
import { createTypeOrmOptions } from './database/typeorm.config';
import { HealthModule } from './modules/health/health.module';
import { createWinstonLoggerOptions } from './shared/logger/winston-logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [appConfig, corsConfig, databaseConfig, loggerConfig, swaggerConfig],
      validationSchema: environmentValidationSchema,
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createWinstonLoggerOptions,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
  ],
})
export class AppModule {} 

