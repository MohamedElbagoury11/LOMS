import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DatabaseConfig } from '../config/database.config';

export const createTypeOrmOptions = (configService: ConfigService): TypeOrmModuleOptions => {
  const database = configService.getOrThrow<DatabaseConfig>('database');

  return {
    type: 'mysql',
    host: database.host,
    port: database.port,
    username: database.username,
    password: database.password,
    database: database.database,
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    migrationsRun: false,
    logging: database.logging,
    charset: 'utf8mb4_unicode_ci',
    autoLoadEntities: true,
  };
};
