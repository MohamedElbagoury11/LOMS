import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res, StreamableFile, UseGuards, ValidationPipe } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ApiWrappedOkResponse } from '../../../common/decorators/api-wrapped-ok-response.decorator';
import { ParseUuidPipe } from '../../../common/pipes/parse-uuid.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../authorization/guards/permissions.guard';
import { CreateDocumentShareDto } from '../dto/requests/create-document-share.dto';
import { DocumentShareListResponseDto } from '../dto/responses/document-share-list-response.dto';
import { DocumentShareResponseDto } from '../dto/responses/document-share-response.dto';
import { SharedDocumentMetadataResponseDto } from '../dto/responses/shared-document-metadata-response.dto';
import { DocumentSharesService } from '../services/document-shares.service';

type AuthenticatedRequest = Request & {
    user?: { id: string; username?: string | null };
};

@ApiTags('Documents')
@Controller()
export class DocumentSharesController {
    constructor(private readonly documentSharesService: DocumentSharesService) {}

    @Post('documents/:id/shares')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.share.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create document share', description: 'Generates a temporary secure share link for a document.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiBody({ type: CreateDocumentShareDto })
    @ApiCreatedResponse({ description: 'Document share created successfully.', type: DocumentShareResponseDto })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.share.create).' })
    @ApiBadRequestResponse({ description: 'Validation failed or share could not be created.' })
    @ApiNotFoundResponse({ description: 'Document not found.' })
    async create(
        @Param('id', ParseUuidPipe) id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: CreateDocumentShareDto,
        @Req() request: AuthenticatedRequest,
    ): Promise<DocumentShareResponseDto> {
        const share = await this.documentSharesService.createShare(id, dto, {
            userId: request.user?.id ?? null,
            username: request.user?.username ?? null,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] ?? 'unknown',
        });

        return {
            id: share.id,
            documentId: share.documentId,
            token: share.token,
            expiresAt: share.expiresAt,
            revokedAt: share.revokedAt,
            createdBy: share.createdBy,
            createdAt: share.createdAt,
            updatedAt: share.updatedAt,
        };
    }

    @Get('documents/:id/shares')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.share.read')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List document shares', description: 'Returns all share links for a specific document.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiWrappedOkResponse(DocumentShareListResponseDto, 'Document shares retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.share.read).' })
    @ApiNotFoundResponse({ description: 'Document not found.' })
    async list(@Param('id', ParseUuidPipe) id: string): Promise<DocumentShareListResponseDto> {
        const shares = await this.documentSharesService.listShares(id);
        return {
            items: shares.map((share) => ({
                id: share.id,
                documentId: share.documentId,
                token: share.token,
                expiresAt: share.expiresAt,
                revokedAt: share.revokedAt,
                createdBy: share.createdBy,
                createdAt: share.createdAt,
                updatedAt: share.updatedAt,
            })),
            total: shares.length,
            page: 1,
            limit: shares.length,
        };
    }

    @Delete('documents/shares/:shareId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.share.revoke')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revoke document share', description: 'Revokes an existing document share link.' })
    @ApiParam({ name: 'shareId', description: 'Document share identifier.' })
    @ApiOkResponse({ description: 'Document share revoked successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.share.revoke).' })
    @ApiNotFoundResponse({ description: 'Document share not found.' })
    async revoke(
        @Param('shareId', ParseUuidPipe) shareId: string,
        @Req() request: AuthenticatedRequest,
    ): Promise<void> {
        await this.documentSharesService.revokeShare(shareId, {
            userId: request.user?.id ?? null,
            username: request.user?.username ?? null,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] ?? 'unknown',
        });
    }

    @Get('shared/:token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get shared document metadata', description: 'Validates a share token and returns metadata for a shared document without requiring authentication.' })
    @ApiParam({ name: 'token', description: 'Secure share token.' })
    @ApiWrappedOkResponse(SharedDocumentMetadataResponseDto, 'Shared document metadata retrieved successfully.')
    @ApiNotFoundResponse({ description: 'Share token is invalid, expired, revoked, or the document is unavailable.' })
    async getSharedMetadata(@Param('token') token: string): Promise<SharedDocumentMetadataResponseDto> {
        return this.documentSharesService.getSharedDocumentMetadata(token);
    }

    @Get('shared/:token/download')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Download shared document', description: 'Streams the shared document file for download using the secure share token.' })
    @ApiParam({ name: 'token', description: 'Secure share token.' })
    @ApiOkResponse({ description: 'Shared document download streamed successfully.' })
    @ApiNotFoundResponse({ description: 'Share token is invalid, expired, revoked, or the document is unavailable.' })
    async downloadShared(@Param('token') token: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
        const result = await this.documentSharesService.downloadSharedDocument(token);

        response.setHeader('Content-Type', result.mimeType);
        response.setHeader('Content-Length', result.fileSize.toString());
        response.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

        return new StreamableFile(result.stream);
    }

    @Get('shared/:token/preview')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Preview shared document', description: 'Streams the shared document for inline preview using the secure share token.' })
    @ApiParam({ name: 'token', description: 'Secure share token.' })
    @ApiOkResponse({ description: 'Shared document preview streamed successfully.' })
    @ApiNotFoundResponse({ description: 'Share token is invalid, expired, revoked, or the document is unavailable.' })
    async previewShared(@Param('token') token: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
        const result = await this.documentSharesService.previewSharedDocument(token);

        response.setHeader('Content-Type', result.mimeType);
        response.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);

        return new StreamableFile(result.stream);
    }
}
