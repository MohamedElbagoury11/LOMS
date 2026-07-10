import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiWrappedOkResponse } from '../../../common/decorators/api-wrapped-ok-response.decorator';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { ParseUuidPipe } from '../../../common/pipes/parse-uuid.pipe';
import { RequirePermissions } from '../../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../authorization/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuditDetailsDto } from '../dto/audit-details.dto';
import { AuditListResponseDto } from '../dto/audit-list-response.dto';
import { AuditQueryDto } from '../dto/audit-query.dto';
import { AuditResponseDto } from '../dto/audit-response.dto';
import { AuditService } from '../services/audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('audit.view')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'List audit logs',
        description: 'Returns paginated, filterable, and searchable audit records.',
    })
    @ApiWrappedOkResponse(AuditListResponseDto, 'Audit logs retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (audit.view).' })
    async findAll(@Query() query: AuditQueryDto): Promise<PaginationResult<AuditResponseDto>> {
        return this.auditService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('audit.view')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get audit log details', description: 'Returns a single audit log record.' })
    @ApiParam({ name: 'id', description: 'Audit log identifier.' })
    @ApiWrappedOkResponse(AuditDetailsDto, 'Audit log retrieved successfully.')
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Missing required permission (audit.view).' })
    async findOne(@Param('id', ParseUuidPipe) id: string): Promise<AuditDetailsDto> {
        return this.auditService.findOne(id);
    }
}
