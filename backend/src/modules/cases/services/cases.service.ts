import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { CaseQueryDto, CaseSortOrder } from '../dto/requests/case-query.dto';
import { CreateCaseDto } from '../dto/requests/create-case.dto';
import { UpdateCaseDto } from '../dto/requests/update-case.dto';
import { CaseResponseDto } from '../dto/responses/case-response.dto';
import { CaseAttachmentDto } from '../dto/shared/case-attachment.dto';
import { CaseClientDto } from '../dto/shared/case-client.dto';
import { CaseLawyerDto } from '../dto/shared/case-lawyer.dto';
import { CaseNoteDto } from '../dto/shared/case-note.dto';
import { CaseOppositePartyDto } from '../dto/shared/case-opposite-party.dto';
import { CaseAttachment } from '../entities/case-attachment.entity';
import { CaseClient } from '../entities/case-client.entity';
import { CaseLawyer } from '../entities/case-lawyer.entity';
import { CaseNote } from '../entities/case-note.entity';
import { CaseOppositeParty } from '../entities/case-opposite-party.entity';
import { Case } from '../entities/case.entity';
import { CasePriority } from '../enums/case-priority.enum';
import { CaseStatus } from '../enums/case-status.enum';
import { CaseType } from '../enums/case-type.enum';

export interface CaseAuditContext {
    userId?: string | null;
    username?: string | null;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class CasesService {
    private readonly logger = new Logger(CasesService.name);

    constructor(
        @InjectRepository(Case)
        private readonly caseRepository: Repository<Case>,
        @InjectRepository(CaseClient)
        private readonly caseClientRepository: Repository<CaseClient>,
        @InjectRepository(CaseLawyer)
        private readonly caseLawyerRepository: Repository<CaseLawyer>,
        @InjectRepository(CaseOppositeParty)
        private readonly caseOppositePartyRepository: Repository<CaseOppositeParty>,
        @InjectRepository(CaseNote)
        private readonly caseNoteRepository: Repository<CaseNote>,
        @InjectRepository(CaseAttachment)
        private readonly caseAttachmentRepository: Repository<CaseAttachment>,
        private readonly dataSource: DataSource,
        private readonly auditService: AuditService,
    ) {}

    async createCase(dto: CreateCaseDto, auditContext?: CaseAuditContext): Promise<CaseResponseDto> {
        this.ensureRequiredCreateFields(dto);
        this.ensureNoDuplicateIds(dto.clientIds, dto.lawyerIds);
        this.validateCaseShape(dto);

        const caseEntity = await this.executeInTransaction(async (manager) => {
            const caseRepository = manager.getRepository(Case);
            const caseClientRepository = manager.getRepository(CaseClient);
            const caseLawyerRepository = manager.getRepository(CaseLawyer);
            const caseOppositePartyRepository = manager.getRepository(CaseOppositeParty);
            const caseNoteRepository = manager.getRepository(CaseNote);
            const caseAttachmentRepository = manager.getRepository(CaseAttachment);

            const entity = caseRepository.create({
                caseNumber: dto.caseNumber.trim(),
                title: dto.title.trim(),
                description: dto.description?.trim() ?? null,
                status: dto.status ?? CaseStatus.Draft,
                type: dto.type ?? CaseType.Custom,
                courtName: dto.courtName?.trim() ?? null,
                courtCircuit: dto.courtCircuit?.trim() ?? null,
                judgeName: dto.judgeName?.trim() ?? null,
                filingDate: dto.filingDate ? new Date(dto.filingDate) : null,
                openingDate: dto.openingDate ? new Date(dto.openingDate) : null,
                closingDate: dto.closingDate ? new Date(dto.closingDate) : null,
                priority: dto.priority ?? CasePriority.Medium,
                createdBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            const savedCase = await caseRepository.save(entity);

            await caseClientRepository.save(dto.clientIds.map((clientId, index) => caseClientRepository.create({
                caseId: savedCase.id,
                clientId,
                isPrimary: index === 0,
                createdBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            })));

            await caseLawyerRepository.save(dto.lawyerIds.map((userId, index) => caseLawyerRepository.create({
                caseId: savedCase.id,
                userId,
                isPrimary: index === 0,
                createdBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            })));

            if (dto.oppositeParties?.length) {
                await caseOppositePartyRepository.save(dto.oppositeParties.map((party) => caseOppositePartyRepository.create({
                    caseId: savedCase.id,
                    name: party.name.trim(),
                    role: party.role?.trim() ?? null,
                    organizationName: party.organizationName?.trim() ?? null,
                    phone: party.phone?.trim() ?? null,
                    email: party.email?.trim() ?? null,
                    createdBy: auditContext?.userId ?? null,
                    updatedBy: auditContext?.userId ?? null,
                })));
            }

            if (dto.notes?.length) {
                await caseNoteRepository.save(dto.notes.map((note) => caseNoteRepository.create({
                    caseId: savedCase.id,
                    content: note.content.trim(),
                    createdBy: auditContext?.userId ?? null,
                    updatedBy: auditContext?.userId ?? null,
                })));
            }

            if (dto.attachments?.length) {
                await caseAttachmentRepository.save(dto.attachments.map((attachment) => caseAttachmentRepository.create({
                    caseId: savedCase.id,
                    fileName: attachment.fileName.trim(),
                    fileSize: attachment.fileSize,
                    mimeType: attachment.mimeType.trim(),
                    storageKey: attachment.storageKey?.trim() ?? '',
                    createdBy: auditContext?.userId ?? null,
                    updatedBy: auditContext?.userId ?? null,
                })));
            }

            return savedCase;
        });

        await this.emitAudit(AuditAction.CASE_CREATED, caseEntity.id, auditContext);
        return this.toResponseDto(await this.loadCase(caseEntity.id));
    }

    async updateCase(id: string, dto: UpdateCaseDto, auditContext?: CaseAuditContext): Promise<CaseResponseDto> {
        if (Object.keys(dto).length === 0) {
            throw new ValidationException('At least one field is required for update.', []);
        }

        const updatedCase = await this.executeInTransaction(async (manager) => {
            const caseRepository = manager.getRepository(Case);
            const caseClientRepository = manager.getRepository(CaseClient);
            const caseLawyerRepository = manager.getRepository(CaseLawyer);
            const caseOppositePartyRepository = manager.getRepository(CaseOppositeParty);
            const caseNoteRepository = manager.getRepository(CaseNote);
            const caseAttachmentRepository = manager.getRepository(CaseAttachment);
            const existing = await caseRepository.findOne({ where: { id }, withDeleted: true });

            if (!existing) {
                throw new NotFoundException('Case not found.');
            }

            if (existing.deletedAt) {
                throw new ConflictException('Archived cases cannot be updated.');
            }

            if (dto.caseNumber !== undefined && dto.caseNumber !== existing.caseNumber) {
                throw new BadRequestException('Case number is immutable.');
            }

            if (dto.clientIds !== undefined) {
                this.ensureNoDuplicateIds(dto.clientIds, dto.lawyerIds);
                await this.syncCaseClients(caseClientRepository, existing.id, dto.clientIds, auditContext?.userId ?? null);
            }

            if (dto.lawyerIds !== undefined) {
                this.ensureNoDuplicateIds(dto.clientIds, dto.lawyerIds);
                await this.syncCaseLawyers(caseLawyerRepository, existing.id, dto.lawyerIds, auditContext?.userId ?? null);
            }

            if (dto.oppositeParties !== undefined) {
                await this.syncOppositeParties(caseOppositePartyRepository, existing.id, dto.oppositeParties, auditContext?.userId ?? null);
            }

            if (dto.notes !== undefined) {
                await this.syncNotes(caseNoteRepository, existing.id, dto.notes, auditContext?.userId ?? null);
            }

            if (dto.attachments !== undefined) {
                await this.syncAttachments(caseAttachmentRepository, existing.id, dto.attachments, auditContext?.userId ?? null);
            }

            const effectiveStatus = dto.status ?? existing.status;
            this.validateStatusTransition(existing.status, effectiveStatus);
            this.validateCaseShape({
                caseNumber: existing.caseNumber,
                title: dto.title ?? existing.title,
                description: dto.description ?? (existing.description ?? undefined),
                status: effectiveStatus,
                type: dto.type ?? existing.type,
                courtName: dto.courtName ?? (existing.courtName ?? undefined),
                courtCircuit: dto.courtCircuit ?? (existing.courtCircuit ?? undefined),
                judgeName: dto.judgeName ?? (existing.judgeName ?? undefined),
                filingDate: dto.filingDate ?? (existing.filingDate ?? undefined),
                openingDate: dto.openingDate ?? (existing.openingDate ?? undefined),
                closingDate: dto.closingDate ?? (existing.closingDate ?? undefined),
                priority: dto.priority ?? existing.priority,
                clientIds: dto.clientIds ?? [],
                lawyerIds: dto.lawyerIds ?? [],
            }, existing);

            Object.assign(existing, {
                title: dto.title !== undefined ? dto.title.trim() : existing.title,
                description: dto.description ?? existing.description,
                status: effectiveStatus,
                type: dto.type ?? existing.type,
                courtName: dto.courtName ?? existing.courtName,
                courtCircuit: dto.courtCircuit ?? existing.courtCircuit,
                judgeName: dto.judgeName ?? existing.judgeName,
                filingDate: dto.filingDate !== undefined ? new Date(dto.filingDate) : existing.filingDate,
                openingDate: dto.openingDate !== undefined ? new Date(dto.openingDate) : existing.openingDate,
                closingDate: dto.closingDate !== undefined ? new Date(dto.closingDate) : existing.closingDate,
                priority: dto.priority ?? existing.priority,
                updatedBy: auditContext?.userId ?? null,
            });

            return caseRepository.save(existing);
        });

        await this.emitAudit(AuditAction.CASE_UPDATED, updatedCase.id, auditContext);
        return this.toResponseDto(await this.loadCase(updatedCase.id));
    }

    async getCase(id: string): Promise<CaseResponseDto> {
        const entity = await this.caseRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: ['caseClients', 'caseLawyers', 'oppositeParties', 'notes', 'attachments'],
        });

        if (!entity) {
            throw new NotFoundException('Case not found.');
        }

        return this.toResponseDto(entity);
    }

    async listCases(query: CaseQueryDto): Promise<PaginationResult<CaseResponseDto>> {
        const baseQuery = this.caseRepository.createQueryBuilder('caseEntity');
        this.applyFilters(baseQuery, query);

        const totalItems = await baseQuery.clone().getCount();

        const normalized = PaginationHelper.normalize({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortDirection: query.sortOrder === CaseSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        });
        const skip = PaginationHelper.getSkip({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortDirection: query.sortOrder === CaseSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        });

        const rows = await baseQuery
            .leftJoinAndSelect('caseEntity.caseClients', 'caseClients')
            .leftJoinAndSelect('caseEntity.caseLawyers', 'caseLawyers')
            .leftJoinAndSelect('caseEntity.oppositeParties', 'oppositeParties')
            .leftJoinAndSelect('caseEntity.notes', 'notes')
            .leftJoinAndSelect('caseEntity.attachments', 'attachments')
            .orderBy(this.resolveSortBy(query.sortBy), query.sortOrder === CaseSortOrder.Desc ? 'DESC' : 'ASC')
            .skip(skip)
            .take(normalized.limit)
            .distinct(true)
            .getMany();

        return PaginationHelper.createResult(
            rows.map((row) => this.toResponseDto(row)),
            totalItems,
            {
                page: normalized.page,
                limit: normalized.limit,
                sortBy: query.sortBy,
                sortDirection: query.sortOrder === CaseSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
            },
        );
    }

    async archiveCase(id: string, auditContext?: CaseAuditContext): Promise<void> {
        const existing = await this.caseRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Case not found.');
        }

        if (existing.deletedAt) {
            throw new ConflictException('Case is already archived.');
        }

        await this.executeInTransaction(async (manager) => {
            const caseRepository = manager.getRepository(Case);
            const current = await caseRepository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Case not found.');
            }

            Object.assign(current, {
                status: CaseStatus.Archived,
                deletedAt: new Date(),
                deletedBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            await caseRepository.save(current);
        });

        await this.emitAudit(AuditAction.CASE_DELETED, id, auditContext);
    }

    async restoreCase(id: string, auditContext?: CaseAuditContext): Promise<CaseResponseDto> {
        const existing = await this.caseRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Case not found.');
        }

        if (!existing.deletedAt) {
            throw new ConflictException('Case is not archived.');
        }

        const restored = await this.executeInTransaction(async (manager) => {
            const caseRepository = manager.getRepository(Case);
            const current = await caseRepository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Case not found.');
            }

            Object.assign(current, {
                status: CaseStatus.Open,
                deletedAt: null,
                deletedBy: null,
                updatedBy: auditContext?.userId ?? null,
            });

            return caseRepository.save(current);
        });

        await this.emitAudit(AuditAction.CASE_UPDATED, restored.id, auditContext);
        return this.toResponseDto(await this.loadCase(restored.id));
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

    private async loadCase(id: string): Promise<Case> {
        const entity = await this.caseRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: ['caseClients', 'caseLawyers', 'oppositeParties', 'notes', 'attachments'],
        });

        if (!entity) {
            throw new NotFoundException('Case not found.');
        }

        return entity;
    }

    private ensureRequiredCreateFields(dto: CreateCaseDto): void {
        if (!dto.caseNumber.trim()) {
            throw new ValidationException('Case number is required.', []);
        }

        if (!dto.title.trim()) {
            throw new ValidationException('Title is required.', []);
        }

        if (!dto.clientIds.length) {
            throw new ValidationException('At least one client is required.', []);
        }

        if (!dto.lawyerIds.length) {
            throw new ValidationException('At least one lawyer is required.', []);
        }
    }

    private ensureNoDuplicateIds(clientIds: string[] | undefined, lawyerIds: string[] | undefined): void {
        const clientUnique = new Set(clientIds ?? []);
        const lawyerUnique = new Set(lawyerIds ?? []);

        if (clientUnique.size !== (clientIds?.length ?? 0)) {
            throw new ConflictException('Duplicate client identifiers are not allowed.');
        }

        if (lawyerUnique.size !== (lawyerIds?.length ?? 0)) {
            throw new ConflictException('Duplicate lawyer identifiers are not allowed.');
        }
    }

    private validateCaseShape(dto: CreateCaseDto | UpdateCaseDto & { caseNumber?: string; title?: string; description?: string | null; status?: CaseStatus; type?: CaseType; courtName?: string | null; courtCircuit?: string | null; judgeName?: string | null; filingDate?: Date | string | null; openingDate?: Date | string | null; closingDate?: Date | string | null; priority?: CasePriority; clientIds?: string[]; lawyerIds?: string[]; }, existing?: Case): void {
        const caseNumber = dto.caseNumber ?? existing?.caseNumber;
        const title = dto.title ?? existing?.title;
        const status = dto.status ?? existing?.status ?? CaseStatus.Draft;
        const type = dto.type ?? existing?.type ?? CaseType.Custom;
        const priority = dto.priority ?? existing?.priority ?? CasePriority.Medium;
        const filingDate = dto.filingDate ? new Date(dto.filingDate) : (existing?.filingDate ?? null);
        const openingDate = dto.openingDate ? new Date(dto.openingDate) : (existing?.openingDate ?? null);
        const closingDate = dto.closingDate ? new Date(dto.closingDate) : (existing?.closingDate ?? null);

        if (!caseNumber?.trim()) {
            throw new ValidationException('Case number is required.', []);
        }

        if (!title?.trim()) {
            throw new ValidationException('Title is required.', []);
        }

        if (!Object.values(CaseStatus).includes(status)) {
            throw new ValidationException('Invalid case status.', []);
        }

        if (!Object.values(CaseType).includes(type)) {
            throw new ValidationException('Invalid case type.', []);
        }

        if (!Object.values(CasePriority).includes(priority)) {
            throw new ValidationException('Invalid case priority.', []);
        }

        if (dto.clientIds?.length === 0) {
            throw new ValidationException('At least one client is required.', []);
        }

        if (dto.lawyerIds?.length === 0) {
            throw new ValidationException('At least one lawyer is required.', []);
        }

        if (filingDate && openingDate && openingDate < filingDate) {
            throw new ValidationException('Opening date cannot be earlier than filing date.', []);
        }

        if (openingDate && closingDate && closingDate <= openingDate) {
            throw new ValidationException('Closing date must be later than opening date.', []);
        }

        if (status === CaseStatus.Closed) {
            if (!caseNumber.trim() || !title.trim()) {
                throw new ValidationException('Closed cases require a title and case number.', []);
            }
        }
    }

    private validateStatusTransition(currentStatus: CaseStatus, nextStatus: CaseStatus): void {
        if (currentStatus === nextStatus) {
            return;
        }

        const allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
            [CaseStatus.Draft]: [CaseStatus.Open, CaseStatus.InProgress, CaseStatus.Waiting],
            [CaseStatus.Open]: [CaseStatus.InProgress, CaseStatus.Waiting, CaseStatus.Closed],
            [CaseStatus.InProgress]: [CaseStatus.Waiting, CaseStatus.Closed],
            [CaseStatus.Waiting]: [CaseStatus.Closed],
            [CaseStatus.Closed]: [CaseStatus.Archived],
            [CaseStatus.Archived]: [],
        };

        if (!allowedTransitions[currentStatus].includes(nextStatus)) {
            throw new ValidationException(`Invalid status transition from ${currentStatus} to ${nextStatus}.`, []);
        }
    }

    private async syncCaseClients(repository: Repository<CaseClient>, caseId: string, clientIds: string[], userId: string | null): Promise<void> {
        const existing = await repository.find({ where: { caseId } });
        const requestedIds = new Set(clientIds);
        const existingIds = new Set(existing.map((item) => item.clientId));

        const toDelete = existing.filter((item) => !requestedIds.has(item.clientId));
        const toAdd = clientIds.filter((clientId) => !existingIds.has(clientId));

        if (toDelete.length) {
            await repository.remove(toDelete);
        }

        if (toAdd.length) {
            await repository.save(toAdd.map((clientId, index) => repository.create({
                caseId,
                clientId,
                isPrimary: index === 0,
                createdBy: userId,
                updatedBy: userId,
            })));
        }
    }

    private async syncCaseLawyers(repository: Repository<CaseLawyer>, caseId: string, lawyerIds: string[], userId: string | null): Promise<void> {
        const existing = await repository.find({ where: { caseId } });
        const requestedIds = new Set(lawyerIds);
        const existingIds = new Set(existing.map((item) => item.userId));

        const toDelete = existing.filter((item) => !requestedIds.has(item.userId));
        const toAdd = lawyerIds.filter((userIdValue) => !existingIds.has(userIdValue));

        if (toDelete.length) {
            await repository.remove(toDelete);
        }

        if (toAdd.length) {
            await repository.save(toAdd.map((userIdValue, index) => repository.create({
                caseId,
                userId: userIdValue,
                isPrimary: index === 0,
                createdBy: userId,
                updatedBy: userId,
            })));
        }
    }

    private async syncOppositeParties(repository: Repository<CaseOppositeParty>, caseId: string, parties: CaseOppositePartyDto[], userId: string | null): Promise<void> {
        const existing = await repository.find({ where: { caseId } });

        await repository.remove(existing);
        if (parties.length) {
            await repository.save(parties.map((party) => repository.create({
                caseId,
                name: party.name.trim(),
                role: party.role?.trim() ?? null,
                organizationName: party.organizationName?.trim() ?? null,
                phone: party.phone?.trim() ?? null,
                email: party.email?.trim() ?? null,
                createdBy: userId,
                updatedBy: userId,
            })));
        }
    }

    private async syncNotes(repository: Repository<CaseNote>, caseId: string, notes: CaseNoteDto[], userId: string | null): Promise<void> {
        const existing = await repository.find({ where: { caseId } });

        await repository.remove(existing);
        if (notes.length) {
            await repository.save(notes.map((note) => repository.create({
                caseId,
                content: note.content.trim(),
                createdBy: userId,
                updatedBy: userId,
            })));
        }
    }

    private async syncAttachments(repository: Repository<CaseAttachment>, caseId: string, attachments: CaseAttachmentDto[], userId: string | null): Promise<void> {
        const existing = await repository.find({ where: { caseId } });

        await repository.remove(existing);
        if (attachments.length) {
            await repository.save(attachments.map((attachment) => repository.create({
                caseId,
                fileName: attachment.fileName.trim(),
                fileSize: attachment.fileSize,
                mimeType: attachment.mimeType.trim(),
                storageKey: attachment.storageKey?.trim() ?? '',
                createdBy: userId,
                updatedBy: userId,
            })));
        }
    }

    private applyFilters(queryBuilder: ReturnType<Repository<Case>['createQueryBuilder']>, query: CaseQueryDto): void {
        queryBuilder.andWhere('caseEntity.deletedAt IS NULL');

        if (query.search) {
            const likeValue = `%${query.search}%`;
            queryBuilder.andWhere(
                '(LOWER(COALESCE(caseEntity.caseNumber, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(caseEntity.title, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(caseEntity.description, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(caseEntity.courtName, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(caseEntity.judgeName, \'\')) LIKE LOWER(:search))',
                { search: likeValue },
            );
        }

        if (query.status) {
            queryBuilder.andWhere('caseEntity.status = :status', { status: query.status });
        }

        if (query.priority) {
            queryBuilder.andWhere('caseEntity.priority = :priority', { priority: query.priority });
        }

        if (query.type) {
            queryBuilder.andWhere('caseEntity.type = :type', { type: query.type });
        }

        if (query.court) {
            queryBuilder.andWhere('LOWER(caseEntity.courtName) LIKE LOWER(:court)', { court: `%${query.court}%` });
        }

        if (query.clientId) {
            queryBuilder.leftJoin('caseEntity.caseClients', 'caseClientsFilter')
                .andWhere('caseClientsFilter.clientId = :clientId', { clientId: query.clientId });
        }

        if (query.lawyerId) {
            queryBuilder.leftJoin('caseEntity.caseLawyers', 'caseLawyersFilter')
                .andWhere('caseLawyersFilter.userId = :lawyerId', { lawyerId: query.lawyerId });
        }

        if (query.dateFrom) {
            queryBuilder.andWhere('caseEntity.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
        }

        if (query.dateTo) {
            queryBuilder.andWhere('caseEntity.createdAt <= :dateTo', { dateTo: query.dateTo });
        }
    }

    private resolveSortBy(sortBy?: string): string {
        const allowedSortFields = new Set([
            'caseNumber',
            'title',
            'status',
            'type',
            'priority',
            'courtName',
            'filingDate',
            'openingDate',
            'closingDate',
            'createdAt',
            'updatedAt',
        ]);

        const normalizedSortBy = sortBy?.trim();
        const field = normalizedSortBy && allowedSortFields.has(normalizedSortBy) ? normalizedSortBy : 'createdAt';
        return `caseEntity.${field}`;
    }

    private async emitAudit(action: AuditAction, entityId: string, auditContext?: CaseAuditContext): Promise<void> {
        try {
            await this.auditService.logSuccess({
                userId: auditContext?.userId ?? null,
                username: auditContext?.username ?? null,
                action,
                entity: AuditEntity.CASE,
                entityId,
                ipAddress: auditContext?.ipAddress ?? 'unknown',
                userAgent: auditContext?.userAgent ?? 'system',
                details: { entity: 'case' },
            });
        } catch (error) {
            this.logger.warn(`Audit emission failed for case ${entityId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private translateError(error: unknown): Error {
        if (error instanceof QueryFailedError) {
            const driverErrorCode = (error as { driverError?: { code?: string } }).driverError?.code ?? '';
            const details = `${error.message}${driverErrorCode}`;

            if (/ER_DUP_ENTRY|23505|duplicate/i.test(details)) {
                return new ConflictException('A case with the supplied unique field already exists.');
            }

            return new BadRequestException('A database error occurred while processing the case request.');
        }

        if (error instanceof ConflictException || error instanceof ValidationException || error instanceof NotFoundException || error instanceof BadRequestException) {
            return error;
        }

        return new BadRequestException('A database error occurred while processing the case request.');
    }

    private toResponseDto(caseEntity: Case): CaseResponseDto {
        return {
            id: caseEntity.id,
            caseNumber: caseEntity.caseNumber,
            title: caseEntity.title,
            description: caseEntity.description,
            status: caseEntity.status,
            type: caseEntity.type,
            courtName: caseEntity.courtName,
            courtCircuit: caseEntity.courtCircuit,
            judgeName: caseEntity.judgeName,
            filingDate: caseEntity.filingDate,
            openingDate: caseEntity.openingDate,
            closingDate: caseEntity.closingDate,
            priority: caseEntity.priority,
            clients: caseEntity.caseClients.map((relation) => this.toClientDto(relation)),
            lawyers: caseEntity.caseLawyers.map((relation) => this.toLawyerDto(relation)),
            oppositeParties: caseEntity.oppositeParties.map((party) => this.toOppositePartyDto(party)),
            notes: caseEntity.notes.map((note) => this.toNoteDto(note)),
            attachments: caseEntity.attachments.map((attachment) => this.toAttachmentDto(attachment)),
            createdAt: caseEntity.createdAt,
            updatedAt: caseEntity.updatedAt,
        };
    }

    private toClientDto(relation: CaseClient): CaseClientDto {
        return {
            id: relation.id,
            clientId: relation.clientId,
            isPrimary: relation.isPrimary,
            createdAt: relation.createdAt,
        };
    }

    private toLawyerDto(relation: CaseLawyer): CaseLawyerDto {
        return {
            id: relation.id,
            userId: relation.userId,
            isPrimary: relation.isPrimary,
            createdAt: relation.createdAt,
        };
    }

    private toOppositePartyDto(party: CaseOppositeParty): CaseOppositePartyDto {
        return {
            id: party.id,
            name: party.name,
            role: party.role,
            organizationName: party.organizationName,
            phone: party.phone,
            email: party.email,
            createdAt: party.createdAt,
        };
    }

    private toNoteDto(note: CaseNote): CaseNoteDto {
        return {
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
        };
    }

    private toAttachmentDto(attachment: CaseAttachment): CaseAttachmentDto {
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
