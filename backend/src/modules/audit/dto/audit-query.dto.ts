import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationDto } from '../../../common/pagination/dto/pagination.dto';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { AuditResult } from '../enums/audit-result.enum';

export class AuditQueryDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Filter by the audited user identifier.' })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({ description: 'Filter by the audited username.' })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional({ enum: AuditEntity, description: 'Filter by audited entity.' })
    @IsEnum(AuditEntity)
    @IsOptional()
    entity?: AuditEntity;

    @ApiPropertyOptional({ description: 'Filter by the affected entity identifier.' })
    @IsUUID()
    @IsOptional()
    entityId?: string;

    @ApiPropertyOptional({ enum: AuditAction, description: 'Filter by audit action.' })
    @IsEnum(AuditAction)
    @IsOptional()
    action?: AuditAction;

    @ApiPropertyOptional({ enum: AuditResult, description: 'Filter by audit outcome.' })
    @IsEnum(AuditResult)
    @IsOptional()
    result?: AuditResult;

    @ApiPropertyOptional({ description: 'Inclusive lower bound for the created timestamp.' })
    @Type(() => Date)
    @IsDateString()
    @IsOptional()
    dateFrom?: Date;

    @ApiPropertyOptional({ description: 'Inclusive upper bound for the created timestamp.' })
    @Type(() => Date)
    @IsDateString()
    @IsOptional()
    dateTo?: Date;

    @ApiPropertyOptional({ description: 'Case-insensitive partial search across core audit fields.' })
    @IsString()
    @IsOptional()
    search?: string;
}
