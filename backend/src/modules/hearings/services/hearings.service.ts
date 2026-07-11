import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';

import { SortDirection } from '../../../common/enums/sort-direction.enum';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { AuditEntity } from '../../audit/enums/audit-entity.enum';
import { AuditService } from '../../audit/services/audit.service';
import { Case } from '../../cases/entities/case.entity';
import { CreateHearingDto } from '../dto/requests/create-hearing.dto';
import { HearingQueryDto, HearingSortOrder } from '../dto/requests/hearing-query.dto';
import { UpdateHearingDto } from '../dto/requests/update-hearing.dto';
import { HearingResponseDto } from '../dto/responses/hearing-response.dto';
import { HearingAttachment } from '../entities/hearing-attachment.entity';
import { HearingNote } from '../entities/hearing-note.entity';
import { Hearing } from '../entities/hearing.entity';
import { HearingResult } from '../enums/hearing-result.enum';
import { HearingStatus } from '../enums/hearing-status.enum';

export interface HearingAuditContext {
    userId?: string | null;
    username?: string | null;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class HearingsService {
    private readonly logger = new Logger(HearingsService.name);

    constructor(
        @InjectRepository(Hearing)
        private readonly hearingRepository: Repository<Hearing>,
        @InjectRepository(HearingNote)
        private readonly hearingNoteRepository: Repository<HearingNote>,
        @InjectRepository(HearingAttachment)
        private readonly hearingAttachmentRepository: Repository<HearingAttachment>,
        @InjectRepository(Case)
        private readonly caseRepository: Repository<Case>,
        private readonly dataSource: DataSource,
        private readonly auditService: AuditService,
    ) {}

    async create(dto: CreateHearingDto, auditContext?: HearingAuditContext): Promise<HearingResponseDto> {
        this.ensureRequiredCreateFields(dto);

        const hearing = await this.executeInTransaction(async (manager) => {
            const hearingRepository = manager.getRepository(Hearing);
            const hearingNoteRepository = manager.getRepository(HearingNote);
            const hearingAttachmentRepository = manager.getRepository(HearingAttachment);
            const caseRepository = manager.getRepository(Case);

            const caseEntity = await caseRepository.findOne({ where: { id: dto.caseId } });
            if (!caseEntity) {
                throw new NotFoundException('Case not found.');
            }

            await this.ensureHearingNumberAvailable(hearingRepository, dto.hearingNumber.trim(), undefined);

            const entity = hearingRepository.create({
                hearingNumber: dto.hearingNumber.trim(),
                caseId: dto.caseId.trim(),
                courtName: dto.courtName?.trim() ?? null,
                chamber: dto.chamber?.trim() ?? null,
                hearingDate: dto.hearingDate ? new Date(dto.hearingDate) : null,
                hearingTime: dto.hearingTime?.trim() ?? null,
                status: dto.status ?? HearingStatus.Scheduled,
                result: dto.result ?? HearingResult.Pending,
                judgeName: dto.judgeName?.trim() ?? null,
                notes: dto.notes?.trim() ?? null,
                nextHearingDate: dto.nextHearingDate ? new Date(dto.nextHearingDate) : null,
                createdBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            const savedHearing = await hearingRepository.save(entity);

            if (dto.notesCollection?.length) {
                await hearingNoteRepository.save(dto.notesCollection.map((note) => hearingNoteRepository.create({
                    hearingId: savedHearing.id,
                    content: note.content.trim(),
                    createdBy: auditContext?.userId ?? null,
                    updatedBy: auditContext?.userId ?? null,
                })));
            }

            if (dto.attachments?.length) {
                await hearingAttachmentRepository.save(dto.attachments.map((attachment) => hearingAttachmentRepository.create({
                    hearingId: savedHearing.id,
                    fileName: attachment.fileName.trim(),
                    fileSize: attachment.fileSize,
                    mimeType: attachment.mimeType.trim(),
                    storageKey: attachment.storageKey?.trim() ?? '',
                    createdBy: auditContext?.userId ?? null,
                    updatedBy: auditContext?.userId ?? null,
                })));
            }

            return savedHearing;
        });

        await this.emitAudit(AuditAction.HEARING_CREATED, hearing.id, auditContext);
        return this.toResponseDto(await this.loadHearing(hearing.id));
    }

    async update(id: string, dto: UpdateHearingDto, auditContext?: HearingAuditContext): Promise<HearingResponseDto> {
        if (Object.keys(dto).length === 0) {
            throw new ValidationException('At least one field is required for update.', []);
        }

        const updatedHearing = await this.executeInTransaction(async (manager) => {
            const hearingRepository = manager.getRepository(Hearing);
            const hearingNoteRepository = manager.getRepository(HearingNote);
            const hearingAttachmentRepository = manager.getRepository(HearingAttachment);
            const caseRepository = manager.getRepository(Case);
            const existing = await hearingRepository.findOne({ where: { id }, withDeleted: true });

            if (!existing) {
                throw new NotFoundException('Hearing not found.');
            }

            if (existing.deletedAt) {
                throw new ConflictException('Archived hearings cannot be updated.');
            }

            if (dto.hearingNumber !== undefined && dto.hearingNumber !== existing.hearingNumber) {
                throw new ValidationException('Hearing number is immutable.', []);
            }

            if (dto.caseId !== undefined && dto.caseId !== existing.caseId) {
                const caseEntity = await caseRepository.findOne({ where: { id: dto.caseId } });
                if (!caseEntity) {
                    throw new NotFoundException('Case not found.');
                }
            }

            if (dto.hearingNumber !== undefined) {
                await this.ensureHearingNumberAvailable(hearingRepository, dto.hearingNumber.trim(), existing.id);
            }

            if (dto.notesCollection !== undefined) {
                await this.syncNotes(hearingNoteRepository, existing.id, dto.notesCollection, auditContext?.userId ?? null);
            }

            if (dto.attachments !== undefined) {
                await this.syncAttachments(hearingAttachmentRepository, existing.id, dto.attachments, auditContext?.userId ?? null);
            }

            Object.assign(existing, {
                caseId: dto.caseId !== undefined ? dto.caseId.trim() : existing.caseId,
                courtName: dto.courtName ?? existing.courtName,
                chamber: dto.chamber ?? existing.chamber,
                hearingDate: dto.hearingDate !== undefined ? new Date(dto.hearingDate) : existing.hearingDate,
                hearingTime: dto.hearingTime ?? existing.hearingTime,
                status: dto.status ?? existing.status,
                result: dto.result ?? existing.result,
                judgeName: dto.judgeName ?? existing.judgeName,
                notes: dto.notes ?? existing.notes,
                nextHearingDate: dto.nextHearingDate !== undefined ? new Date(dto.nextHearingDate) : existing.nextHearingDate,
                updatedBy: auditContext?.userId ?? null,
            });

            return hearingRepository.save(existing);
        });

        await this.emitAudit(AuditAction.HEARING_UPDATED, updatedHearing.id, auditContext);
        return this.toResponseDto(await this.loadHearing(updatedHearing.id));
    }

    async findOne(id: string): Promise<HearingResponseDto> {
        const hearing = await this.hearingRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: ['notesCollection', 'attachments'],
        });

        if (!hearing) {
            throw new NotFoundException('Hearing not found.');
        }

        return this.toResponseDto(hearing);
    }

    async findAll(query: HearingQueryDto): Promise<PaginationResult<HearingResponseDto>> {
        const baseQuery = this.hearingRepository.createQueryBuilder('hearing');
        this.applyFilters(baseQuery, query);

        const totalItems = await baseQuery.clone().getCount();

        const normalized = PaginationHelper.normalize({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortDirection: query.sortOrder === HearingSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        });
        const skip = PaginationHelper.getSkip({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortDirection: query.sortOrder === HearingSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        });

        const rows = await baseQuery
            .leftJoinAndSelect('hearing.notesCollection', 'notesCollection')
            .leftJoinAndSelect('hearing.attachments', 'attachments')
            .orderBy(this.resolveSortBy(query.sortBy), query.sortOrder === HearingSortOrder.Desc ? 'DESC' : 'ASC')
            .skip(skip)
            .take(normalized.limit)
            .getMany();

        return PaginationHelper.createResult(
            rows.map((row) => this.toResponseDto(row)),
            totalItems,
            {
                page: normalized.page,
                limit: normalized.limit,
                sortBy: query.sortBy,
                sortDirection: query.sortOrder === HearingSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
            },
        );
    }

    async archive(id: string, auditContext?: HearingAuditContext): Promise<void> {
        const existing = await this.hearingRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Hearing not found.');
        }

        if (existing.deletedAt) {
            throw new ConflictException('Hearing is already archived.');
        }

        await this.executeInTransaction(async (manager) => {
            const hearingRepository = manager.getRepository(Hearing);
            const current = await hearingRepository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Hearing not found.');
            }

            Object.assign(current, {
                deletedAt: new Date(),
                deletedBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            await hearingRepository.save(current);
        });

        await this.emitAudit(AuditAction.HEARING_DELETED, id, auditContext);
    }

    async restore(id: string, auditContext?: HearingAuditContext): Promise<HearingResponseDto> {
        const existing = await this.hearingRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Hearing not found.');
        }

        if (!existing.deletedAt) {
            throw new ConflictException('Hearing is not archived.');
        }

        const restored = await this.executeInTransaction(async (manager) => {
            const hearingRepository = manager.getRepository(Hearing);
            const current = await hearingRepository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Hearing not found.');
            }

            Object.assign(current, {
                deletedAt: null,
                deletedBy: null,
                updatedBy: auditContext?.userId ?? null,
            });

            return hearingRepository.save(current);
        });

        await this.emitAudit(AuditAction.HEARING_UPDATED, restored.id, auditContext);
        return this.toResponseDto(await this.loadHearing(restored.id));
    }

    private async executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await operation(queryRunner.manager);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw this.translateError(error);
        } finally {
            await queryRunner.release();
        }
    }

    private async loadHearing(id: string): Promise<Hearing> {
        const hearing = await this.hearingRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: ['notesCollection', 'attachments'],
        });

        if (!hearing) {
            throw new NotFoundException('Hearing not found.');
        }

        return hearing;
    }

    private async ensureHearingNumberAvailable(
        repository: Repository<Hearing>,
        hearingNumber: string,
        currentId?: string,
    ): Promise<void> {
        const existing = await repository.findOne({ where: { hearingNumber }, withDeleted: true });

        if (existing && existing.id !== currentId) {
            throw new ConflictException('A hearing with the same hearing number already exists.');
        }
    }

    private async syncNotes(
        repository: Repository<HearingNote>,
        hearingId: string,
        notes: { content: string }[],
        userId: string | null,
    ): Promise<void> {
        await repository.delete({ hearingId });

        if (!notes.length) {
            return;
        }

        await repository.save(notes.map((note) => repository.create({
            hearingId,
            content: note.content.trim(),
            createdBy: userId,
            updatedBy: userId,
        })));
    }

    private async syncAttachments(
        repository: Repository<HearingAttachment>,
        hearingId: string,
        attachments: {
            fileName: string;
            fileSize: number;
            mimeType: string;
            storageKey?: string;
        }[],
        userId: string | null,
    ): Promise<void> {
        await repository.delete({ hearingId });

        if (!attachments.length) {
            return;
        }

        await repository.save(attachments.map((attachment) => repository.create({
            hearingId,
            fileName: attachment.fileName.trim(),
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType.trim(),
            storageKey: attachment.storageKey?.trim() ?? '',
            createdBy: userId,
            updatedBy: userId,
        })));
    }

    private applyFilters(queryBuilder: ReturnType<Repository<Hearing>['createQueryBuilder']>, query: HearingQueryDto): void {
        queryBuilder.andWhere('hearing.deletedAt IS NULL');

        if (query.search) {
            const likeValue = `%${query.search}%`;
            queryBuilder.andWhere(
                '(LOWER(COALESCE(hearing.hearingNumber, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(hearing.caseId, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(hearing.courtName, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(hearing.chamber, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(hearing.judgeName, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(hearing.notes, \'\')) LIKE LOWER(:search))',
                { search: likeValue },
            );
        }

        if (query.caseId) {
            queryBuilder.andWhere('hearing.caseId = :caseId', { caseId: query.caseId });
        }

        if (query.status) {
            queryBuilder.andWhere('hearing.status = :status', { status: query.status });
        }

        if (query.result) {
            queryBuilder.andWhere('hearing.result = :result', { result: query.result });
        }

        if (query.court) {
            queryBuilder.andWhere('LOWER(hearing.courtName) LIKE LOWER(:court)', { court: `%${query.court}%` });
        }

        if (query.dateFrom) {
            queryBuilder.andWhere('hearing.hearingDate >= :dateFrom', { dateFrom: query.dateFrom });
        }

        if (query.dateTo) {
            queryBuilder.andWhere('hearing.hearingDate <= :dateTo', { dateTo: query.dateTo });
        }
    }

    private resolveSortBy(sortBy?: string): string {
        const allowedSortFields = new Set([
            'hearingNumber',
            'caseId',
            'hearingDate',
            'status',
            'result',
            'courtName',
            'judgeName',
            'createdAt',
            'updatedAt',
        ]);

        const normalizedSortBy = sortBy?.trim();
        const field = normalizedSortBy && allowedSortFields.has(normalizedSortBy) ? normalizedSortBy : 'createdAt';
        return `hearing.${field}`;
    }

    private async emitAudit(action: AuditAction, entityId: string, auditContext?: HearingAuditContext): Promise<void> {
        try {
            await this.auditService.logSuccess({
                userId: auditContext?.userId ?? null,
                username: auditContext?.username ?? null,
                action,
                entity: AuditEntity.HEARING,
                entityId,
                ipAddress: auditContext?.ipAddress ?? 'unknown',
                userAgent: auditContext?.userAgent ?? 'system',
                details: { entity: 'hearing' },
            });
        } catch (error) {
            this.logger.warn(`Audit emission failed for hearing ${entityId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private ensureRequiredCreateFields(dto: CreateHearingDto): void {
        if (!dto.hearingNumber.trim()) {
            throw new ValidationException('Hearing number is required.', []);
        }

        if (!dto.caseId.trim()) {
            throw new ValidationException('Case id is required.', []);
        }
    }

    private translateError(error: unknown): Error {
        if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof ValidationException) {
            return error;
        }

        if (this.isUniqueConstraintError(error)) {
            return new ConflictException(this.resolveUniqueConstraintMessage(error));
        }

        return error instanceof Error ? error : new Error(String(error));
    }

    private isUniqueConstraintError(error: unknown): boolean {
        if (error instanceof QueryFailedError) {
            const driverErrorCode = (error as { driverError?: { code?: string } }).driverError?.code ?? '';
            const details = `${error.message}${driverErrorCode}`;
            return /ER_DUP_ENTRY|23505|duplicate/i.test(details);
        }

        const message = error instanceof Error ? error.message : String(error);
        return /ER_DUP_ENTRY|23505|duplicate/i.test(message);
    }

    private resolveUniqueConstraintMessage(error: unknown): string {
        const details = String(error instanceof Error ? error.message : error);
        if (/UQ_hearings_hearing_number/i.test(details)) {
            return 'A hearing with the same hearing number already exists.';
        }

        return 'A hearing with the supplied unique field already exists.';
    }

    private toResponseDto(hearing: Hearing): HearingResponseDto {
        return {
            id: hearing.id,
            hearingNumber: hearing.hearingNumber,
            caseId: hearing.caseId,
            courtName: hearing.courtName,
            chamber: hearing.chamber,
            hearingDate: hearing.hearingDate,
            hearingTime: hearing.hearingTime,
            status: hearing.status,
            result: hearing.result,
            judgeName: hearing.judgeName,
            notes: hearing.notes,
            nextHearingDate: hearing.nextHearingDate,
            notesCollection: hearing.notesCollection.map((note) => this.toNoteDto(note)),
            attachments: hearing.attachments.map((attachment) => this.toAttachmentDto(attachment)),
            createdAt: hearing.createdAt,
            updatedAt: hearing.updatedAt,
        };
    }

    private toNoteDto(note: HearingNote): { id: string; content: string; createdAt: Date } {
        return {
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
        };
    }

    private toAttachmentDto(attachment: HearingAttachment): {
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        storageKey?: string;
        createdAt: Date;
    } {
        return {
            id: attachment.id,
            fileName: attachment.fileName,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            storageKey: attachment.storageKey,
            createdAt: attachment.createdAt,
        };
    }
}
