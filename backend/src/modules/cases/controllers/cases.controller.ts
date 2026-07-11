import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
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

import { ApiWrappedOkResponse } from '../../../common/decorators/api-wrapped-ok-response.decorator';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { ParseUuidPipe } from '../../../common/pipes/parse-uuid.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../authorization/guards/permissions.guard';
import { CaseQueryDto } from '../dto/requests/case-query.dto';
import { CreateCaseDto } from '../dto/requests/create-case.dto';
import { UpdateCaseDto } from '../dto/requests/update-case.dto';
import { CaseListResponseDto } from '../dto/responses/case-list-response.dto';
import { CaseResponseDto } from '../dto/responses/case-response.dto';
import { CasesService } from '../services/cases.service';

@ApiTags('Cases')
@Controller('cases')
export class CasesController {
    constructor(private readonly casesService: CasesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('cases.view')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List cases', description: 'Returns paginated, filterable, and sortable cases.' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'contract' })
    @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED', 'ARCHIVED'] })
    @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
    @ApiQuery({ name: 'type', required: false, enum: ['COMMERCIAL', 'CIVIL', 'CRIMINAL', 'CUSTOM'] })
    @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC' })
    @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date-time' })
    @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date-time' })
    @ApiWrappedOkResponse(CaseListResponseDto, 'Cases retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (cases.view).' })
    async findAll(@Query(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) query: CaseQueryDto): Promise<PaginationResult<CaseResponseDto>> {
        return this.casesService.listCases(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('cases.view')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get case details', description: 'Returns a single case by identifier.' })
    @ApiParam({ name: 'id', description: 'Case identifier.' })
    @ApiWrappedOkResponse(CaseResponseDto, 'Case retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (cases.view).' })
    @ApiNotFoundResponse({ description: 'Case was not found.' })
    async findOne(@Param('id', ParseUuidPipe) id: string): Promise<CaseResponseDto> {
        return this.casesService.getCase(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('cases.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create case', description: 'Creates a new case.' })
    @ApiBody({ type: CreateCaseDto })
    @ApiCreatedResponse({ description: 'Case created successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (cases.create).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiConflictResponse({ description: 'Case already exists.' })
    async create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: CreateCaseDto): Promise<CaseResponseDto> {
        return this.casesService.createCase(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('cases.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update case', description: 'Updates an existing case.' })
    @ApiParam({ name: 'id', description: 'Case identifier.' })
    @ApiBody({ type: UpdateCaseDto })
    @ApiWrappedOkResponse(CaseResponseDto, 'Case updated successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (cases.update).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiNotFoundResponse({ description: 'Case was not found.' })
    @ApiConflictResponse({ description: 'Case update conflict.' })
    async update(
        @Param('id', ParseUuidPipe) id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: UpdateCaseDto,
    ): Promise<CaseResponseDto> {
        return this.casesService.updateCase(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('cases.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Archive case', description: 'Archives a case using soft delete semantics.' })
    @ApiParam({ name: 'id', description: 'Case identifier.' })
    @ApiOkResponse({ description: 'Case archived successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (cases.delete).' })
    @ApiNotFoundResponse({ description: 'Case was not found.' })
    @ApiConflictResponse({ description: 'Case cannot be archived.' })
    async softDelete(@Param('id', ParseUuidPipe) id: string): Promise<void> {
        await this.casesService.archiveCase(id);
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('cases.restore')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restore case', description: 'Restores an archived case.' })
    @ApiParam({ name: 'id', description: 'Case identifier.' })
    @ApiWrappedOkResponse(CaseResponseDto, 'Case restored successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (cases.restore).' })
    @ApiNotFoundResponse({ description: 'Case was not found.' })
    @ApiConflictResponse({ description: 'Case cannot be restored.' })
    async restore(@Param('id', ParseUuidPipe) id: string): Promise<CaseResponseDto> {
        return this.casesService.restoreCase(id);
    }
}
