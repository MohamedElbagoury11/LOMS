import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiConsumes,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Response } from 'express';

interface UploadedFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

import { ApiWrappedOkResponse } from '../../../common/decorators/api-wrapped-ok-response.decorator';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { ParseUuidPipe } from '../../../common/pipes/parse-uuid.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../authorization/guards/permissions.guard';
import { CreateDocumentDto } from '../dto/requests/create-document.dto';
import { DocumentQueryDto } from '../dto/requests/document-query.dto';
import { UpdateDocumentDto } from '../dto/requests/update-document.dto';
import { UploadDocumentDto } from '../dto/requests/upload-document.dto';
import { DocumentListResponseDto } from '../dto/responses/document-list-response.dto';
import { DocumentResponseDto } from '../dto/responses/document-response.dto';
import { DocumentsService } from '../services/documents.service';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.read')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List documents', description: 'Returns paginated, filterable, and sortable documents.' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'registration' })
    @ApiQuery({ name: 'clientId', required: false, type: String, example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiQuery({ name: 'caseId', required: false, type: String, example: '550e8400-e29b-41d4-a716-446655440010' })
    @ApiQuery({ name: 'archived', required: false, type: Boolean, example: false })
    @ApiQuery({ name: 'uploadedFrom', required: false, type: String, format: 'date-time' })
    @ApiQuery({ name: 'uploadedTo', required: false, type: String, format: 'date-time' })
    @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC' })
    @ApiWrappedOkResponse(DocumentListResponseDto, 'Documents retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.read).' })
    async findAll(@Query(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) query: DocumentQueryDto): Promise<PaginationResult<DocumentResponseDto>> {
        return this.documentsService.findAll(query);
    }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload document', description: 'Uploads a document file and persists metadata.' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['clientId', 'displayName', 'file'],
            properties: {
                clientId: { type: 'string', format: 'uuid' },
                caseId: { type: 'string', format: 'uuid' },
                displayName: { type: 'string' },
                description: { type: 'string' },
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiCreatedResponse({ description: 'Document uploaded successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.upload).' })
    @ApiBadRequestResponse({ description: 'Validation failed or invalid upload.' })
    async upload(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: UploadDocumentDto,
        @UploadedFile() file: UploadedFile,
    ): Promise<DocumentResponseDto> {
        return this.documentsService.upload(dto, file);
    }

    @Get(':id/download')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.download')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Download document', description: 'Downloads the stored file for a document.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiOkResponse({ description: 'Document downloaded successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.download).' })
    @ApiNotFoundResponse({ description: 'Document or physical file was not found.' })
    async download(@Param('id', ParseUuidPipe) id: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
        const result = await this.documentsService.download(id);

        response.setHeader('Content-Type', result.mimeType);
        response.setHeader('Content-Length', result.fileSize.toString());
        response.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

        return new StreamableFile(result.stream);
    }

    @Get(':id/preview')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.preview')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Preview document', description: 'Streams a supported document for inline preview.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiOkResponse({ description: 'Document preview streamed successfully.' })
    @ApiBadRequestResponse({ description: 'Document preview is unavailable for this file type.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.preview).' })
    @ApiNotFoundResponse({ description: 'Document or physical file was not found.' })
    async preview(@Param('id', ParseUuidPipe) id: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
        const result = await this.documentsService.preview(id);

        response.setHeader('Content-Type', result.mimeType);
        response.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);

        return new StreamableFile(result.stream);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.read')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get document details', description: 'Returns a single document by identifier.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiWrappedOkResponse(DocumentResponseDto, 'Document retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.read).' })
    @ApiNotFoundResponse({ description: 'Document was not found.' })
    async findOne(@Param('id', ParseUuidPipe) id: string): Promise<DocumentResponseDto> {
        return this.documentsService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create document', description: 'Creates a new document.' })
    @ApiBody({ type: CreateDocumentDto })
    @ApiCreatedResponse({ description: 'Document created successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.create).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiConflictResponse({ description: 'Document already exists.' })
    async create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: CreateDocumentDto): Promise<DocumentResponseDto> {
        return this.documentsService.create(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update document', description: 'Updates an existing document.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiBody({ type: UpdateDocumentDto })
    @ApiWrappedOkResponse(DocumentResponseDto, 'Document updated successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.update).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiNotFoundResponse({ description: 'Document was not found.' })
    @ApiConflictResponse({ description: 'Document update conflict.' })
    async update(
        @Param('id', ParseUuidPipe) id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: UpdateDocumentDto,
    ): Promise<DocumentResponseDto> {
        return this.documentsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Archive document', description: 'Archives a document using soft delete semantics.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiOkResponse({ description: 'Document archived successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.delete).' })
    @ApiNotFoundResponse({ description: 'Document was not found.' })
    @ApiConflictResponse({ description: 'Document cannot be archived.' })
    async softDelete(@Param('id', ParseUuidPipe) id: string): Promise<void> {
        await this.documentsService.archive(id);
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('documents.restore')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restore document', description: 'Restores an archived document.' })
    @ApiParam({ name: 'id', description: 'Document identifier.' })
    @ApiWrappedOkResponse(DocumentResponseDto, 'Document restored successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (documents.restore).' })
    @ApiNotFoundResponse({ description: 'Document was not found.' })
    @ApiConflictResponse({ description: 'Document cannot be restored.' })
    async restore(@Param('id', ParseUuidPipe) id: string): Promise<DocumentResponseDto> {
        return this.documentsService.restore(id);
    }
}
