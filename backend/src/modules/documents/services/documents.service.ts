import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fileTypeFromBuffer } from 'file-type';
import { extname } from 'node:path';
import { Readable } from 'node:stream';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';

import { SortDirection } from '../../../common/enums/sort-direction.enum';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { UuidHelper } from '../../../common/helpers/uuid.helper';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { FileNameUtil } from '../../../common/utils/file-name.util';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { AuditEntity } from '../../audit/enums/audit-entity.enum';
import { AuditService } from '../../audit/services/audit.service';
import { Case } from '../../cases/entities/case.entity';
import { Client } from '../../clients/entities/client.entity';
import { storageConfig } from '../../storage/config/storage.config';
import { StorageService } from '../../storage/services/storage.service';
import { CreateDocumentDto } from '../dto/requests/create-document.dto';
import { DocumentQueryDto, DocumentSortOrder } from '../dto/requests/document-query.dto';
import { UpdateDocumentDto } from '../dto/requests/update-document.dto';
import { UploadDocumentDto } from '../dto/requests/upload-document.dto';
import { DocumentResponseDto } from '../dto/responses/document-response.dto';
import { Document } from '../entities/document.entity';

export interface DocumentAuditContext {
    userId?: string | null;
    username?: string | null;
    ipAddress?: string;
    userAgent?: string;
}

export interface DownloadDocumentResult {
    stream: Readable;
    fileName: string;
    mimeType: string;
    fileSize: number;
}

export interface PreviewDocumentResult {
    stream: Readable;
    fileName: string;
    mimeType: string;
}

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);

    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        @InjectRepository(Case)
        private readonly caseRepository: Repository<Case>,
        private readonly dataSource: DataSource,
        private readonly auditService: AuditService,
        private readonly storageService: StorageService,
    ) {}

    async create(dto: CreateDocumentDto, auditContext?: DocumentAuditContext): Promise<DocumentResponseDto> {
        this.ensureRequiredCreateFields(dto);

        const client = await this.clientRepository.findOne({ where: { id: dto.clientId }, withDeleted: true });
        if (!client) {
            throw new NotFoundException('Client not found.');
        }

        if (dto.caseId) {
            const caseEntity = await this.caseRepository.findOne({ where: { id: dto.caseId }, withDeleted: true });
            if (!caseEntity) {
                throw new NotFoundException('Case not found.');
            }
        }

        const document = await this.executeInTransaction(async (manager) => {
            const documentRepository = manager.getRepository(Document);

            const entity = documentRepository.create({
                clientId: dto.clientId.trim(),
                caseId: dto.caseId ? dto.caseId.trim() : null,
                displayName: dto.displayName.trim(),
                originalFileName: dto.originalFileName.trim(),
                extension: dto.extension.trim().toLowerCase(),
                mimeType: dto.mimeType.trim(),
                fileSize: dto.fileSize,
                storageKey: dto.storageKey.trim(),
                description: dto.description ? dto.description.trim() : null,
                createdBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            return documentRepository.save(entity);
        });

        await this.emitAudit(AuditAction.DOCUMENT_CREATED, document.id, auditContext);
        return this.toResponseDto(document);
    }

    async upload(dto: UploadDocumentDto, file: { buffer?: Buffer; originalname?: string; mimetype?: string; size?: number }, auditContext?: DocumentAuditContext): Promise<DocumentResponseDto> {
        this.validateUploadFile(file);

        const client = await this.clientRepository.findOne({ where: { id: dto.clientId }, withDeleted: true });
        if (!client) {
            throw new NotFoundException('Client not found.');
        }

        if (dto.caseId) {
            const caseEntity = await this.caseRepository.findOne({ where: { id: dto.caseId }, withDeleted: true });
            if (!caseEntity) {
                throw new NotFoundException('Case not found.');
            }
        }

        const extension = this.normaliseExtension(file.originalname ?? '');
        const mimeType = this.normaliseMimeType(file.mimetype ?? '');
        this.validateUploadFile(file, extension, mimeType);

        // Validate magic number to prevent file type spoofing
        await this.validateMagicNumber(file.buffer ?? Buffer.from([]), extension, mimeType);

        const storageDirectory = this.buildStorageDirectory(dto.clientId, dto.caseId);
        const storageKey = this.buildStorageKey(extension);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.storageService.upload(file.buffer ?? Buffer.from([]), storageKey, storageDirectory);

            const documentRepository = queryRunner.manager.getRepository(Document);
            const sanitizedFileName = FileNameUtil.sanitize(file.originalname ?? 'file');

            const entity = documentRepository.create({
                clientId: dto.clientId.trim(),
                caseId: dto.caseId ? dto.caseId.trim() : null,
                displayName: dto.displayName.trim(),
                originalFileName: sanitizedFileName,
                extension,
                mimeType,
                fileSize: file.size ?? 0,
                storageKey,
                description: dto.description ? dto.description.trim() : null,
                createdBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            const document = await documentRepository.save(entity);
            await queryRunner.commitTransaction();

            await this.emitAudit(AuditAction.DOCUMENT_CREATED, document.id, auditContext);
            return this.toResponseDto(document);
        } catch (error) {
            await this.storageService.delete(storageKey, storageDirectory).catch(() => undefined);
            await queryRunner.rollbackTransaction();
            throw this.translateError(error);
        } finally {
            await queryRunner.release();
        }
    }

    async download(id: string): Promise<DownloadDocumentResult> {
        const document = await this.documentRepository.findOne({ where: { id }, withDeleted: true });

        if (!document) {
            throw new NotFoundException('Document not found.');
        }

        const storageDirectory = this.buildStorageDirectory(document.clientId, document.caseId);
        const exists = await this.storageService.exists(document.storageKey, storageDirectory);

        if (!exists) {
            throw new NotFoundException('Physical file not found.');
        }

        const stream = await this.storageService.download(document.storageKey, storageDirectory);
        const sanitizedFileName = FileNameUtil.sanitize(document.originalFileName);

        return {
            stream,
            fileName: sanitizedFileName,
            mimeType: document.mimeType,
            fileSize: document.fileSize,
        };
    }

    async preview(id: string): Promise<PreviewDocumentResult> {
        const document = await this.documentRepository.findOne({ where: { id }, withDeleted: true });

        if (!document) {
            throw new NotFoundException('Document not found.');
        }

        if (document.deletedAt) {
            throw new ConflictException('Archived documents cannot be previewed.');
        }

        const supportedPreviewTypes = new Set(['pdf', 'png', 'jpg', 'jpeg', 'txt']);
        if (!supportedPreviewTypes.has(document.extension.toLowerCase())) {
            throw new ValidationException('Document preview is unavailable for this file type.', []);
        }

        const storageDirectory = this.buildStorageDirectory(document.clientId, document.caseId);
        const exists = await this.storageService.exists(document.storageKey, storageDirectory);

        if (!exists) {
            throw new NotFoundException('Physical file not found.');
        }

        const stream = await this.storageService.download(document.storageKey, storageDirectory);
        const sanitizedFileName = FileNameUtil.sanitize(document.originalFileName);

        return {
            stream,
            fileName: sanitizedFileName,
            mimeType: document.mimeType,
        };
    }

    async update(id: string, dto: UpdateDocumentDto, auditContext?: DocumentAuditContext): Promise<DocumentResponseDto> {
        if (Object.keys(dto).length === 0) {
            throw new ValidationException('At least one field is required for update.', []);
        }

        const updatedDocument = await this.executeInTransaction(async (manager) => {
            const documentRepository = manager.getRepository(Document);
            const existing = await documentRepository.findOne({ where: { id }, withDeleted: true });

            if (!existing) {
                throw new NotFoundException('Document not found.');
            }

            if (existing.deletedAt) {
                throw new ConflictException('Archived documents cannot be updated.');
            }

            if (dto.clientId !== undefined && dto.clientId !== existing.clientId) {
                const client = await this.clientRepository.findOne({ where: { id: dto.clientId }, withDeleted: true });
                if (!client) {
                    throw new NotFoundException('Client not found.');
                }
            }

            if (dto.caseId !== undefined) {
                if (dto.caseId) {
                    const caseEntity = await this.caseRepository.findOne({ where: { id: dto.caseId }, withDeleted: true });
                    if (!caseEntity) {
                        throw new NotFoundException('Case not found.');
                    }
                }
            }

            Object.assign(existing, {
                clientId: dto.clientId !== undefined ? dto.clientId.trim() : existing.clientId,
                caseId: dto.caseId !== undefined ? dto.caseId.trim() : existing.caseId,
                displayName: dto.displayName !== undefined ? dto.displayName.trim() : existing.displayName,
                description: dto.description !== undefined ? dto.description.trim() : existing.description,
                updatedBy: auditContext?.userId ?? null,
            });

            return documentRepository.save(existing);
        });

        await this.emitAudit(AuditAction.DOCUMENT_UPDATED, updatedDocument.id, auditContext);
        return this.toResponseDto(updatedDocument);
    }

    async findOne(id: string): Promise<DocumentResponseDto> {
        const document = await this.documentRepository.findOne({ where: { id }, withDeleted: true });

        if (!document) {
            throw new NotFoundException('Document not found.');
        }

        return this.toResponseDto(document);
    }

    async findAll(query: DocumentQueryDto): Promise<PaginationResult<DocumentResponseDto>> {
        const baseQuery = this.documentRepository.createQueryBuilder('document');
        this.applyFilters(baseQuery, query);

        const totalItems = await baseQuery.clone().getCount();

        const normalized = PaginationHelper.normalize({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortDirection: query.sortOrder === DocumentSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        });
        const skip = PaginationHelper.getSkip({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortDirection: query.sortOrder === DocumentSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        });

        const rows = await baseQuery
            .orderBy(this.resolveSortBy(query.sortBy), query.sortOrder === DocumentSortOrder.Desc ? 'DESC' : 'ASC')
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
                sortDirection: query.sortOrder === DocumentSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
            },
        );
    }

    async archive(id: string, auditContext?: DocumentAuditContext): Promise<void> {
        const existing = await this.documentRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Document not found.');
        }

        if (existing.deletedAt) {
            throw new ConflictException('Document is already archived.');
        }

        await this.executeInTransaction(async (manager) => {
            const documentRepository = manager.getRepository(Document);
            const current = await documentRepository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Document not found.');
            }

            Object.assign(current, {
                deletedAt: new Date(),
                deletedBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            await documentRepository.save(current);
        });

        await this.emitAudit(AuditAction.DOCUMENT_DELETED, id, auditContext);
    }

    async restore(id: string, auditContext?: DocumentAuditContext): Promise<DocumentResponseDto> {
        const existing = await this.documentRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Document not found.');
        }

        if (!existing.deletedAt) {
            throw new ConflictException('Document is not archived.');
        }

        const restored = await this.executeInTransaction(async (manager) => {
            const documentRepository = manager.getRepository(Document);
            const current = await documentRepository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Document not found.');
            }

            Object.assign(current, {
                deletedAt: null,
                deletedBy: null,
                updatedBy: auditContext?.userId ?? null,
            });

            return documentRepository.save(current);
        });

        await this.emitAudit(AuditAction.DOCUMENT_UPDATED, restored.id, auditContext);
        return this.toResponseDto(restored);
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

    private applyFilters(queryBuilder: ReturnType<Repository<Document>['createQueryBuilder']>, query: DocumentQueryDto): void {
        if (query.archived !== true) {
            queryBuilder.andWhere('document.deletedAt IS NULL');
        }

        if (query.archived === true) {
            queryBuilder.andWhere('document.deletedAt IS NOT NULL');
        }

        if (query.clientId) {
            queryBuilder.andWhere('document.clientId = :clientId', { clientId: query.clientId });
        }

        if (query.caseId) {
            queryBuilder.andWhere('document.caseId = :caseId', { caseId: query.caseId });
        }

        if (query.extension) {
            queryBuilder.andWhere('LOWER(document.extension) = LOWER(:extension)', { extension: query.extension });
        }

        if (query.search) {
            const likeValue = `%${query.search}%`;
            queryBuilder.andWhere(
                "(LOWER(COALESCE(document.displayName, '')) LIKE LOWER(:search) OR LOWER(COALESCE(document.description, '')) LIKE LOWER(:search) OR LOWER(COALESCE(document.originalFileName, '')) LIKE LOWER(:search) OR LOWER(COALESCE(document.extension, '')) LIKE LOWER(:search))",
                { search: likeValue },
            );
        }

        if (query.uploadedFrom) {
            queryBuilder.andWhere('document.createdAt >= :uploadedFrom', { uploadedFrom: query.uploadedFrom });
        }

        if (query.uploadedTo) {
            queryBuilder.andWhere('document.createdAt <= :uploadedTo', { uploadedTo: query.uploadedTo });
        }
    }

    private resolveSortBy(sortBy?: string): string {
        const allowedSortFields = new Set([
            'displayName',
            'fileSize',
            'extension',
            'createdAt',
            'updatedAt',
        ]);

        const normalizedSortBy = sortBy?.trim();
        const field = normalizedSortBy && allowedSortFields.has(normalizedSortBy) ? normalizedSortBy : 'createdAt';
        return `document.${field}`;
    }

    private validateUploadFile(file: { buffer?: Buffer; originalname?: string; mimetype?: string; size?: number }, extension?: string, mimeType?: string): void {
        if (!file.buffer || file.buffer.length === 0) {
            throw new ValidationException('A file upload is required.', []);
        }

        if ((file.size ?? file.buffer.length) > storageConfig.maxFileSize) {
            throw new ValidationException(`File size exceeds the maximum allowed size of ${storageConfig.maxFileSize.toString()} bytes.`, []);
        }

        if (extension) {
            const normalizedExtension = extension.toLowerCase();
            if (!storageConfig.allowedExtensions.includes(normalizedExtension)) {
                throw new ValidationException('Invalid file type.', []);
            }
        }

        if (mimeType) {
            const normalizedMimeType = mimeType.toLowerCase();
            if (!storageConfig.allowedMimeTypes.includes(normalizedMimeType)) {
                throw new ValidationException('Invalid file type.', []);
            }
        }
    }

    private async validateMagicNumber(buffer: Buffer, claimedExtension: string, claimedMimeType: string): Promise<void> {
        if (buffer.length === 0) {
            throw new ValidationException('Cannot validate empty file.', []);
        }

        // Detect actual file type from magic bytes
        const detectedType = await fileTypeFromBuffer(buffer);

        if (!detectedType) {
            // file-type couldn't determine the type
            // Allow text files that don't have strong signatures
            if (claimedExtension === 'txt' && claimedMimeType === 'text/plain') {
                return;
            }

            throw new ValidationException('Could not determine actual file type. File may be corrupted or invalid.', []);
        }

        // Map detected MIME type to our allowed extensions
        const detectedExtension = this.getExtensionFromMimeType(detectedType.mime);

        if (!detectedExtension) {
            throw new ValidationException('Detected file type is not supported.', []);
        }

        // Verify claimed extension matches detected type
        if (claimedExtension !== detectedExtension) {
            throw new ValidationException(`File type mismatch. Claimed extension is '.${claimedExtension}' but actual file type is '.${detectedExtension}'.`, []);
        }

        // Verify claimed MIME type matches detected type
        if (!detectedType.mime.toLowerCase().includes(claimedMimeType.split('/')[0])) {
            throw new ValidationException(`File type mismatch. Claimed MIME type is '${claimedMimeType}' but actual file type is '${detectedType.mime}'.`, []);
        }
    }

    private getExtensionFromMimeType(mimeType: string): string | null {
        const mimeToExtension: Record<string, string> = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'application/zip': 'zip',
            'text/plain': 'txt',
        };

        return mimeToExtension[mimeType.toLowerCase()] ?? null;
    }

    private buildStorageDirectory(clientId: string, caseId?: string | null): string {
        return caseId ? `clients/${clientId}/cases/${caseId}/documents` : `clients/${clientId}/documents`;
    }

    private buildStorageKey(extension: string): string {
        return `${UuidHelper.generate()}.${extension}`;
    }

    private normaliseExtension(fileName: string): string {
        return extname(fileName).replace('.', '').trim().toLowerCase();
    }

    private normaliseMimeType(mimeType: string): string {
        return mimeType.trim().toLowerCase();
    }

    private async emitAudit(action: AuditAction, entityId: string, auditContext?: DocumentAuditContext): Promise<void> {
        try {
            await this.auditService.logSuccess({
                userId: auditContext?.userId ?? null,
                username: auditContext?.username ?? null,
                action,
                entity: AuditEntity.DOCUMENT,
                entityId,
                ipAddress: auditContext?.ipAddress ?? 'unknown',
                userAgent: auditContext?.userAgent ?? 'system',
                details: { entity: 'document' },
            });
        } catch (error) {
            this.logger.warn(`Audit emission failed for document ${entityId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private ensureRequiredCreateFields(dto: CreateDocumentDto): void {
        if (!dto.clientId.trim()) {
            throw new ValidationException('Client id is required.', []);
        }

        if (!dto.displayName.trim()) {
            throw new ValidationException('Display name is required.', []);
        }

        if (!dto.originalFileName.trim()) {
            throw new ValidationException('Original file name is required.', []);
        }

        if (!dto.extension.trim()) {
            throw new ValidationException('File extension is required.', []);
        }

        if (!dto.mimeType.trim()) {
            throw new ValidationException('MIME type is required.', []);
        }

        if (!dto.storageKey.trim()) {
            throw new ValidationException('Storage key is required.', []);
        }

        if (dto.fileSize <= 0) {
            throw new ValidationException('File size must be greater than zero.', []);
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
        if (/UQ_documents/i.test(details)) {
            return 'A document with the same unique field already exists.';
        }

        return 'A document with the supplied unique field already exists.';
    }

    private toResponseDto(document: Document): DocumentResponseDto {
        return {
            id: document.id,
            clientId: document.clientId,
            caseId: document.caseId,
            displayName: document.displayName,
            originalFileName: document.originalFileName,
            extension: document.extension,
            mimeType: document.mimeType,
            fileSize: document.fileSize,
            description: document.description,
            archived: Boolean(document.deletedAt),
            uploadedBy: document.createdBy,
            uploadedAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}
