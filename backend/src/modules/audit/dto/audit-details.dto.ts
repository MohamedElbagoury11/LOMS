import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { AuditResult } from '../enums/audit-result.enum';

export class AuditDetailsDto {
    @ApiProperty({ description: 'Audit record identifier.' })
    id!: string;

    @ApiPropertyOptional({ description: 'User identifier that triggered the action.' })
    userId!: string | null;

    @ApiPropertyOptional({ description: 'Username associated with the event.' })
    username!: string | null;

    @ApiProperty({ enum: AuditAction, description: 'The audited action.' })
    action!: AuditAction;

    @ApiProperty({ enum: AuditEntity, description: 'The audited entity.' })
    entity!: AuditEntity;

    @ApiPropertyOptional({ description: 'Identifier of the affected entity.' })
    entityId!: string | null;

    @ApiProperty({ enum: AuditResult, description: 'Outcome of the action.' })
    result!: AuditResult;

    @ApiProperty({ description: 'Client IP address.' })
    ipAddress!: string;

    @ApiProperty({ description: 'Client user agent.' })
    userAgent!: string;

    @ApiProperty({ description: 'Structured event details.' })
    details!: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Safe metadata associated with the action.' })
    metadata!: Record<string, unknown> | null;

    @ApiProperty({ description: 'Timestamp when the event was created.' })
    createdAt!: Date;

    @ApiProperty({ description: 'Timestamp when the event was last updated.' })
    updatedAt!: Date;
}
