import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SortDirection } from '../../../common/enums/sort-direction.enum';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { AuditResult } from '../enums/audit-result.enum';
import { AuditQueryDto } from '../dto/audit-query.dto';
import { AuditResponseDto } from '../dto/audit-response.dto';
import { AuditDetailsDto } from '../dto/audit-details.dto';

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
}

/**
 * Persists immutable audit trail records and exposes query support.
 */
@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) {}

    async log(input: AuditLogInput & { result: AuditResult }): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create({
            userId: input.userId ?? null,
            username: input.username ?? null,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId ?? null,
            result: input.result,
            ipAddress: this.sanitizeValue(input.ipAddress),
            userAgent: this.sanitizeValue(input.userAgent),
            details: (this.sanitizeMetadata(input.details ?? {}) ?? {}) as Record<string, unknown>,
            metadata: this.sanitizeMetadata(input.metadata ?? null) as Record<string, unknown> | null,
        });

        return this.auditLogRepository.save(auditLog);
    }

    async logSuccess(input: AuditLogInput): Promise<AuditLog> {
        return this.log({ ...input, result: AuditResult.SUCCESS });
    }

    async logFailure(input: AuditLogInput): Promise<AuditLog> {
        return this.log({ ...input, result: AuditResult.FAILED });
    }

    async logDenied(input: AuditLogInput): Promise<AuditLog> {
        return this.log({ ...input, result: AuditResult.DENIED });
    }

    async findAll(query: AuditQueryDto): Promise<PaginationResult<AuditResponseDto>> {
        const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

        const sortDirection = query.sortDirection === SortDirection.Desc ? 'DESC' : 'ASC';
        const sortBy = this.resolveSortBy(query.sortBy);
        queryBuilder.orderBy(`auditLog.${sortBy}`, sortDirection);

        this.applyFilters(queryBuilder, query);

        const totalItems = await queryBuilder.getCount();

        const normalized = PaginationHelper.normalize(query);
        const skip = PaginationHelper.getSkip(query);

        const rows = await queryBuilder
            .skip(skip)
            .take(normalized.limit)
            .getMany();

        return PaginationHelper.createResult(
            rows.map((row) => this.toResponseDto(row)),
            totalItems,
            query,
        );
    }

    async findOne(id: string): Promise<AuditDetailsDto> {
        const auditLog = await this.auditLogRepository.findOne({ where: { id } });

        if (!auditLog) {
            throw new NotFoundException('Audit log not found.');
        }

        return this.toDetailsDto(auditLog);
    }

    private applyFilters(
        queryBuilder: ReturnType<Repository<AuditLog>['createQueryBuilder']>,
        query: AuditQueryDto,
    ): void {
        if (query.userId) {
            queryBuilder.andWhere('auditLog.userId = :userId', { userId: query.userId });
        }

        if (query.username) {
            queryBuilder.andWhere('LOWER(auditLog.username) LIKE LOWER(:username)', {
                username: `%${query.username}%`,
            });
        }

        if (query.entity) {
            queryBuilder.andWhere('auditLog.entity = :entity', { entity: query.entity });
        }

        if (query.entityId) {
            queryBuilder.andWhere('auditLog.entityId = :entityId', { entityId: query.entityId });
        }

        if (query.action) {
            queryBuilder.andWhere('auditLog.action = :action', { action: query.action });
        }

        if (query.result) {
            queryBuilder.andWhere('auditLog.result = :result', { result: query.result });
        }

        if (query.dateFrom) {
            queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
        }

        if (query.dateTo) {
            queryBuilder.andWhere('auditLog.createdAt <= :dateTo', { dateTo: query.dateTo });
        }

        if (query.search) {
            const likeValue = `%${query.search}%`;
            queryBuilder.andWhere(
                "(LOWER(auditLog.username) LIKE LOWER(:search) OR LOWER(auditLog.action) LIKE LOWER(:search) OR LOWER(auditLog.entity) LIKE LOWER(:search) OR LOWER(COALESCE(auditLog.entityId, '')) LIKE LOWER(:search))",
                { search: likeValue },
            );
        }
    }

    private resolveSortBy(sortBy?: string): string {
        const allowedSortFields = new Set([
            'createdAt',
            'userId',
            'username',
            'entity',
            'entityId',
            'action',
            'result',
            'ipAddress',
            'userAgent',
        ]);

        const normalizedSortBy = sortBy?.trim();

        return normalizedSortBy && allowedSortFields.has(normalizedSortBy) ? normalizedSortBy : 'createdAt';
    }

    private sanitizeValue(value: string | null | undefined): string {
        if (!value) {
            return 'unknown';
        }

        return value.replace(/\r?\n/g, ' ').slice(0, 500);
    }

    private sanitizeMetadata(value: unknown): unknown {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'string') {
            return this.sanitizeValue(value);
        }

        if (Array.isArray(value)) {
            return value
                .filter((item): item is NonNullable<typeof item> => item !== null && item !== undefined)
                .map((item) => this.sanitizeMetadata(item));
        }

        if (typeof value === 'object') {
            return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
                (acc, [key, entryValue]) => {
                    const safeKey = key.toLowerCase();
                    if (safeKey.includes('password') || safeKey.includes('token') || safeKey.includes('header') || safeKey.includes('cookie') || safeKey.includes('authorization')) {
                        return acc;
                    }

                    acc[safeKey] = this.sanitizeMetadata(entryValue);
                    return acc;
                },
                {},
            );
        }

        return value;
    }

    private toResponseDto(auditLog: AuditLog): AuditResponseDto {
        return {
            id: auditLog.id,
            userId: auditLog.userId,
            username: auditLog.username,
            action: auditLog.action,
            entity: auditLog.entity,
            entityId: auditLog.entityId,
            result: auditLog.result,
            ipAddress: auditLog.ipAddress,
            userAgent: auditLog.userAgent,
            details: auditLog.details,
            metadata: auditLog.metadata,
            createdAt: auditLog.createdAt,
        };
    }

    private toDetailsDto(auditLog: AuditLog): AuditDetailsDto {
        return {
            id: auditLog.id,
            userId: auditLog.userId,
            username: auditLog.username,
            action: auditLog.action,
            entity: auditLog.entity,
            entityId: auditLog.entityId,
            result: auditLog.result,
            ipAddress: auditLog.ipAddress,
            userAgent: auditLog.userAgent,
            details: auditLog.details,
            metadata: auditLog.metadata,
            createdAt: auditLog.createdAt,
            updatedAt: auditLog.updatedAt,
        };
    }
}
