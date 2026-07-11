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
import { CreateHearingDto } from '../dto/requests/create-hearing.dto';
import { HearingQueryDto } from '../dto/requests/hearing-query.dto';
import { UpdateHearingDto } from '../dto/requests/update-hearing.dto';
import { HearingListResponseDto } from '../dto/responses/hearing-list-response.dto';
import { HearingResponseDto } from '../dto/responses/hearing-response.dto';
import { HearingsService } from '../services/hearings.service';

@ApiTags('Hearings')
@Controller('hearings')
export class HearingsController {
    constructor(private readonly hearingsService: HearingsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('hearings.read')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List hearings', description: 'Returns paginated, filterable, and sortable hearings.' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'court hearing' })
    @ApiQuery({ name: 'caseId', required: false, type: String, example: '550e8400-e29b-41d4-a716-446655440010' })
    @ApiQuery({ name: 'status', required: false, enum: ['SCHEDULED', 'ADJOURNED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'] })
    @ApiQuery({ name: 'result', required: false, enum: ['PENDING', 'FAVORABLE', 'UNFAVORABLE', 'PARTIALLY_FAVORABLE'] })
    @ApiQuery({ name: 'court', required: false, type: String, example: 'Cairo Economic Court' })
    @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'hearingDate' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC' })
    @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date-time' })
    @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date-time' })
    @ApiWrappedOkResponse(HearingListResponseDto, 'Hearings retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (hearings.read).' })
    async findAll(@Query(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) query: HearingQueryDto): Promise<PaginationResult<HearingResponseDto>> {
        return this.hearingsService.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('hearings.read')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get hearing details', description: 'Returns a single hearing by identifier.' })
    @ApiParam({ name: 'id', description: 'Hearing identifier.' })
    @ApiWrappedOkResponse(HearingResponseDto, 'Hearing retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (hearings.read).' })
    @ApiNotFoundResponse({ description: 'Hearing was not found.' })
    async findOne(@Param('id', ParseUuidPipe) id: string): Promise<HearingResponseDto> {
        return this.hearingsService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('hearings.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create hearing', description: 'Creates a new hearing.' })
    @ApiBody({ type: CreateHearingDto })
    @ApiCreatedResponse({ description: 'Hearing created successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (hearings.create).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiConflictResponse({ description: 'Hearing already exists.' })
    async create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: CreateHearingDto): Promise<HearingResponseDto> {
        return this.hearingsService.create(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('hearings.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update hearing', description: 'Updates an existing hearing.' })
    @ApiParam({ name: 'id', description: 'Hearing identifier.' })
    @ApiBody({ type: UpdateHearingDto })
    @ApiWrappedOkResponse(HearingResponseDto, 'Hearing updated successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (hearings.update).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiNotFoundResponse({ description: 'Hearing was not found.' })
    @ApiConflictResponse({ description: 'Hearing update conflict.' })
    async update(
        @Param('id', ParseUuidPipe) id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: UpdateHearingDto,
    ): Promise<HearingResponseDto> {
        return this.hearingsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('hearings.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Archive hearing', description: 'Archives a hearing using soft delete semantics.' })
    @ApiParam({ name: 'id', description: 'Hearing identifier.' })
    @ApiOkResponse({ description: 'Hearing archived successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (hearings.delete).' })
    @ApiNotFoundResponse({ description: 'Hearing was not found.' })
    @ApiConflictResponse({ description: 'Hearing cannot be archived.' })
    async softDelete(@Param('id', ParseUuidPipe) id: string): Promise<void> {
        await this.hearingsService.archive(id);
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('hearings.restore')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restore hearing', description: 'Restores an archived hearing.' })
    @ApiParam({ name: 'id', description: 'Hearing identifier.' })
    @ApiWrappedOkResponse(HearingResponseDto, 'Hearing restored successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (hearings.restore).' })
    @ApiNotFoundResponse({ description: 'Hearing was not found.' })
    @ApiConflictResponse({ description: 'Hearing cannot be restored.' })
    async restore(@Param('id', ParseUuidPipe) id: string): Promise<HearingResponseDto> {
        return this.hearingsService.restore(id);
    }
}
