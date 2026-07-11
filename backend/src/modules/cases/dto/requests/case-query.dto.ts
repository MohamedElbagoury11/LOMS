import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

import { CasePriority } from '../../enums/case-priority.enum';
import { CaseStatus } from '../../enums/case-status.enum';
import { CaseType } from '../../enums/case-type.enum';

export enum CaseSortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export class CaseQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number.', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ example: 20, description: 'Number of records per page.', minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional({ description: 'Case-insensitive partial search across case fields.', example: 'contract' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: CaseStatus, description: 'Filter by case status.', example: CaseStatus.Open })
  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @ApiPropertyOptional({ enum: CasePriority, description: 'Filter by case priority.', example: CasePriority.High })
  @IsEnum(CasePriority)
  @IsOptional()
  priority?: CasePriority;

  @ApiPropertyOptional({ enum: CaseType, description: 'Filter by case type.', example: CaseType.Commercial })
  @IsEnum(CaseType)
  @IsOptional()
  type?: CaseType;

  @ApiPropertyOptional({ description: 'Filter by court name.', example: 'Cairo Economic Court' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  court?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned lawyer identifier.', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  lawyerId?: string;

  @ApiPropertyOptional({ description: 'Filter by client identifier.', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Inclusive lower bound for case creation date.', example: '2026-01-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Inclusive upper bound for case creation date.', example: '2026-12-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ description: 'Field to sort by.', example: 'createdAt' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sortBy?: string;

  @ApiPropertyOptional({ enum: CaseSortOrder, description: 'Sort direction.', example: CaseSortOrder.Desc, default: CaseSortOrder.Desc })
  @IsEnum(CaseSortOrder)
  @IsOptional()
  sortOrder: CaseSortOrder = CaseSortOrder.Desc;
}
