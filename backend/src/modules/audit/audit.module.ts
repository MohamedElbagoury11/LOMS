import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '../authorization/authorization.module';
import { AuthModule } from '../auth/auth.module';
import { AuditController } from './controllers/audit.controller';
import { AuditLog } from './entities/audit-log.entity';
import { AuditEventListenerService } from './services/audit-event-listener.service';
import { AuditService } from './services/audit.service';

/**
 * Audit module for persisting immutable security and business activity records.
 *
 * Exports the shared audit service for internal use by the application.
 */
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog]), AuthModule, AuthorizationModule],
    controllers: [AuditController],
    providers: [AuditService, AuditEventListenerService],
    exports: [AuditService],
})
export class AuditModule {}
