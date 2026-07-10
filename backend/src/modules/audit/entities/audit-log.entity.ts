import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { AuditResult } from '../enums/audit-result.enum';

/**
 * Immutable audit trail record for security and business events.
 *
 * See docs/03-Development Guide.md §14 and docs/06-AUTHENTICATION_DESIGN.md §19.
 */
@Entity(DatabaseTable.AUDIT_LOGS)
@Index('idx_audit_logs_created_at', ['createdAt'])
@Index('idx_audit_logs_user_id', ['userId'])
@Index('idx_audit_logs_entity', ['entity'])
@Index('idx_audit_logs_entity_id', ['entityId'])
@Index('idx_audit_logs_action', ['action'])
@Index('idx_audit_logs_result', ['result'])
@Index('idx_audit_logs_created_at_result', ['createdAt', 'result'])
@Index('idx_audit_logs_user_created_at', ['userId', 'createdAt'])
@Index('idx_audit_logs_entity_action', ['entity', 'action'])
export class AuditLog extends BaseEntity {
    @Column({
        name: 'user_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    })
    userId!: string | null;

    @Column({
        name: 'username',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    username!: string | null;

    @Column({
        name: 'action',
        type: 'enum',
        enum: AuditAction,
    })
    action!: AuditAction;

    @Column({
        name: 'entity',
        type: 'enum',
        enum: AuditEntity,
    })
    entity!: AuditEntity;

    @Column({
        name: 'entity_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    })
    entityId!: string | null;

    @Column({
        name: 'result',
        type: 'enum',
        enum: AuditResult,
    })
    result!: AuditResult;

    @Column({
        name: 'ip_address',
        type: 'varchar',
        length: 45,
    })
    ipAddress!: string;

    @Column({
        name: 'user_agent',
        type: 'varchar',
        length: 500,
    })
    userAgent!: string;

    @Column({
        name: 'details',
        type: 'json',
    })
    details!: Record<string, unknown>;

    @Column({
        name: 'metadata',
        type: 'json',
        nullable: true,
    })
    metadata!: Record<string, unknown> | null;
}
