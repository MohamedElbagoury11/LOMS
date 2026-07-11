import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { AuditEntity } from '../../audit/enums/audit-entity.enum';
import { AuditService } from '../../audit/services/audit.service';
import { DocumentsService } from './documents.service';
import { StorageService } from '../../storage/services/storage.service';
import { Document } from '../entities/document.entity';
import { CreateDocumentShareDto } from '../dto/requests/create-document-share.dto';
import { DocumentShare } from '../entities/document-share.entity';

export interface DocumentShareAuditContext {
    userId?: string | null;
    username?: string | null;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class DocumentSharesService {
    private readonly logger = new Logger(DocumentSharesService.name);

    constructor(
        @InjectRepository(DocumentShare)
        private readonly documentShareRepository: Repository<DocumentShare>,
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        private readonly documentsService: DocumentsService,
        private readonly storageService: StorageService,
        private readonly auditService: AuditService,
    ) {}

    async createShare(documentId: string, dto: CreateDocumentShareDto, auditContext?: DocumentShareAuditContext): Promise<DocumentShare> {
        const document = await this.documentRepository.findOne({ where: { id: documentId }, withDeleted: true });

        if (!document) {
            throw new NotFoundException('Document not found.');
        }

        if (document.deletedAt) {
            throw new ConflictException('Archived documents cannot be shared.');
        }

        const expiresAt = new Date(dto.expiresAt);
        if (Number.isNaN(expiresAt.getTime())) {
            throw new ValidationException('Expiration date is invalid.', []);
        }

        if (expiresAt <= new Date()) {
            throw new ValidationException('Expiration date must be in the future.', []);
        }

        const token = await this.generateUniqueToken();

        const share = this.documentShareRepository.create({
            documentId: document.id,
            token,
            expiresAt,
            revokedAt: null,
            createdBy: auditContext?.userId ?? null,
            updatedBy: auditContext?.userId ?? null,
        });

        const savedShare = await this.documentShareRepository.save(share);
        await this.emitAudit(AuditAction.DOCUMENT_SHARE_CREATED, savedShare.id, auditContext);

        return savedShare;
    }

    async listShares(documentId: string): Promise<DocumentShare[]> {
        const document = await this.documentRepository.findOne({ where: { id: documentId }, withDeleted: true });

        if (!document) {
            throw new NotFoundException('Document not found.');
        }

        return this.documentShareRepository.find({ where: { documentId }, order: { createdAt: 'DESC' } });
    }

    async revokeShare(shareId: string, auditContext?: DocumentShareAuditContext): Promise<void> {
        const share = await this.documentShareRepository.findOne({ where: { id: shareId } });

        if (!share) {
            throw new NotFoundException('Document share not found.');
        }

        if (share.revokedAt) {
            throw new ConflictException('Document share is already revoked.');
        }

        share.revokedAt = new Date();
        share.updatedBy = auditContext?.userId ?? null;

        await this.documentShareRepository.save(share);
        await this.emitAudit(AuditAction.DOCUMENT_SHARE_REVOKED, share.id, auditContext);
    }

    async findByToken(token: string): Promise<DocumentShare> {
        const share = await this.documentShareRepository.findOne({
            where: { token },
            relations: ['document'],
        });

        if (!share || share.revokedAt || share.expiresAt <= new Date() || share.document.deletedAt) {
            throw new NotFoundException('Share token is invalid, expired, revoked, or the document is unavailable.');
        }

        return share;
    }

    async getSharedDocumentMetadata(token: string) {
        const share = await this.validateShareToken(token);
        const storageDirectory = this.buildStorageDirectory(share.document.clientId, share.document.caseId);
        const exists = await this.storageService.exists(share.document.storageKey, storageDirectory);

        if (!exists) {
            throw new NotFoundException('Shared document file not found.');
        }

        return {
            displayName: share.document.displayName,
            originalFileName: share.document.originalFileName,
            fileSize: share.document.fileSize,
            mimeType: share.document.mimeType,
            expiresAt: share.expiresAt,
            createdAt: share.createdAt,
            previewSupported: this.isPreviewSupported(share.document.extension),
            downloadSupported: true,
        };
    }

    async downloadSharedDocument(token: string) {
        const share = await this.validateShareToken(token);
        return this.documentsService.download(share.document.id);
    }

    async previewSharedDocument(token: string) {
        const share = await this.validateShareToken(token);
        return this.documentsService.preview(share.document.id);
    }

    private isPreviewSupported(extension: string): boolean {
        const supportedPreviewTypes = new Set(['pdf', 'png', 'jpg', 'jpeg', 'txt']);
        return supportedPreviewTypes.has(extension.toLowerCase());
    }

    private buildStorageDirectory(clientId: string, caseId?: string | null): string {
        return caseId ? `clients/${clientId}/cases/${caseId}/documents` : `clients/${clientId}/documents`;
    }

    private async validateShareToken(token: string): Promise<DocumentShare> {
        const share = await this.documentShareRepository.findOne({
            where: { token },
            relations: ['document'],
        });

        if (!share || share.revokedAt || share.expiresAt <= new Date() || share.document.deletedAt) {
            throw new NotFoundException('Share token is invalid, expired, revoked, or the document is unavailable.');
        }

        return share;
    }

    private async generateUniqueToken(): Promise<string> {
        for (;;) {
            const token = randomBytes(32).toString('base64url');
            const existing = await this.documentShareRepository.findOne({ where: { token } });
            if (!existing) {
                return token;
            }
        }
    }

    private async emitAudit(action: AuditAction, entityId: string, auditContext?: DocumentShareAuditContext): Promise<void> {
        try {
            await this.auditService.logSuccess({
                userId: auditContext?.userId ?? null,
                username: auditContext?.username ?? null,
                action,
                entity: AuditEntity.DOCUMENT,
                entityId,
                ipAddress: auditContext?.ipAddress ?? 'unknown',
                userAgent: auditContext?.userAgent ?? 'system',
                details: { entity: 'document_share' },
            });
        } catch (error) {
            this.logger.warn(`Audit emission failed for document share ${entityId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
