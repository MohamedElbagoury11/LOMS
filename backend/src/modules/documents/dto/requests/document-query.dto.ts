import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export enum DocumentSortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export class DocumentQueryDto {
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

  @ApiPropertyOptional({ description: 'Case-insensitive partial search across document fields.', example: 'registration' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by client identifier.', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filter by case identifier.', example: '550e8400-e29b-41d4-a716-446655440010' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional({ description: 'Filter by archive status.', example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  archived?: boolean;

  @ApiPropertyOptional({ description: 'Filter by file extension.', example: 'pdf' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  extension?: string;

  @ApiPropertyOptional({ description: 'Inclusive lower bound for upload date.', example: '2026-07-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  uploadedFrom?: Date;

  @ApiPropertyOptional({ description: 'Inclusive upper bound for upload date.', example: '2026-07-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  uploadedTo?: Date;

  @ApiPropertyOptional({ description: 'Field to sort by.', example: 'createdAt' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sortBy?: string;

  @ApiPropertyOptional({ enum: DocumentSortOrder, description: 'Sort direction.', example: DocumentSortOrder.Desc, default: DocumentSortOrder.Desc })
  @IsOptional()
  sortOrder: DocumentSortOrder = DocumentSortOrder.Desc;
}
