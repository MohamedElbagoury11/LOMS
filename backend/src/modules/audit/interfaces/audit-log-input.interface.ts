import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { AuditResult } from '../enums/audit-result.enum';

export interface AuditLogInput {
    userId?: string | null;
    username?: string | null;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string | null;
    ipAddress: string;
    userAgent: string;
    details?: Record<string, unknown>;
    metadata?: Record<string, unknown> | null;
    result?: AuditResult;
}
