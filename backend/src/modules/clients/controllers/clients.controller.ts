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
import { ClientQueryDto } from '../dto/requests/client-query.dto';
import { CreateClientDto } from '../dto/requests/create-client.dto';
import { UpdateClientDto } from '../dto/requests/update-client.dto';
import { ClientListResponseDto } from '../dto/responses/client-list-response.dto';
import { ClientResponseDto } from '../dto/responses/client-response.dto';
import { ClientsService } from '../services/clients.service';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('clients.view')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List clients', description: 'Returns paginated, filterable, and sortable clients.' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'Ahmed' })
    @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] })
    @ApiQuery({ name: 'type', required: false, enum: ['INDIVIDUAL', 'ORGANIZATION'] })
    @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC' })
    @ApiQuery({ name: 'createdFrom', required: false, type: String, format: 'date-time' })
    @ApiQuery({ name: 'createdTo', required: false, type: String, format: 'date-time' })
    @ApiWrappedOkResponse(ClientListResponseDto, 'Clients retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (clients.view).' })
    async findAll(@Query() query: ClientQueryDto): Promise<PaginationResult<ClientResponseDto>> {
        return this.clientsService.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('clients.view')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get client details', description: 'Returns a single client by identifier.' })
    @ApiParam({ name: 'id', description: 'Client identifier.' })
    @ApiWrappedOkResponse(ClientResponseDto, 'Client retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (clients.view).' })
    @ApiNotFoundResponse({ description: 'Client was not found.' })
    async findOne(@Param('id', ParseUuidPipe) id: string): Promise<ClientResponseDto> {
        return this.clientsService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('clients.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create client', description: 'Creates a new client.' })
    @ApiBody({ type: CreateClientDto })
    @ApiCreatedResponse({ description: 'Client created successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (clients.create).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiConflictResponse({ description: 'Client already exists.' })
    async create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: CreateClientDto): Promise<ClientResponseDto> {
        return this.clientsService.create(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('clients.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update client', description: 'Updates an existing client.' })
    @ApiParam({ name: 'id', description: 'Client identifier.' })
    @ApiBody({ type: UpdateClientDto })
    @ApiWrappedOkResponse(ClientResponseDto, 'Client updated successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (clients.update).' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    @ApiNotFoundResponse({ description: 'Client was not found.' })
    @ApiConflictResponse({ description: 'Client update conflict.' })
    async update(
        @Param('id', ParseUuidPipe) id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: UpdateClientDto,
    ): Promise<ClientResponseDto> {
        return this.clientsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('clients.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Archive client', description: 'Archives a client using soft delete semantics.' })
    @ApiParam({ name: 'id', description: 'Client identifier.' })
    @ApiOkResponse({ description: 'Client archived successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (clients.delete).' })
    @ApiNotFoundResponse({ description: 'Client was not found.' })
    @ApiConflictResponse({ description: 'Client cannot be archived.' })
    async softDelete(@Param('id', ParseUuidPipe) id: string): Promise<void> {
        await this.clientsService.softDelete(id);
    }

    @Post(':id/restore')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('clients.restore')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Restore client', description: 'Restores an archived client.' })
    @ApiParam({ name: 'id', description: 'Client identifier.' })
    @ApiWrappedOkResponse(ClientResponseDto, 'Client restored successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (clients.restore).' })
    @ApiNotFoundResponse({ description: 'Client was not found.' })
    @ApiConflictResponse({ description: 'Client cannot be restored.' })
    async restore(@Param('id', ParseUuidPipe) id: string): Promise<ClientResponseDto> {
        return this.clientsService.restore(id);
    }
}
