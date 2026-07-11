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

import { HearingResult } from '../../enums/hearing-result.enum';
import { HearingStatus } from '../../enums/hearing-status.enum';

export enum HearingSortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export class HearingQueryDto {
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

  @ApiPropertyOptional({ description: 'Case-insensitive partial search across hearing fields.', example: 'contract' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by case identifier.', example: '550e8400-e29b-41d4-a716-446655440010' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional({ enum: HearingStatus, description: 'Filter by hearing status.', example: HearingStatus.Scheduled })
  @IsEnum(HearingStatus)
  @IsOptional()
  status?: HearingStatus;

  @ApiPropertyOptional({ enum: HearingResult, description: 'Filter by hearing result.', example: HearingResult.Pending })
  @IsEnum(HearingResult)
  @IsOptional()
  result?: HearingResult;

  @ApiPropertyOptional({ description: 'Filter by court name.', example: 'Cairo Economic Court' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  court?: string;

  @ApiPropertyOptional({ description: 'Inclusive lower bound for hearing date.', example: '2026-07-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Inclusive upper bound for hearing date.', example: '2026-07-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ description: 'Field to sort by.', example: 'createdAt' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sortBy?: string;

  @ApiPropertyOptional({ enum: HearingSortOrder, description: 'Sort direction.', example: HearingSortOrder.Desc, default: HearingSortOrder.Desc })
  @IsEnum(HearingSortOrder)
  @IsOptional()
  sortOrder: HearingSortOrder = HearingSortOrder.Desc;
}
