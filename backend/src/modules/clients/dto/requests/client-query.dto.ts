import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

import { ClientStatus } from '../../enums/client-status.enum';
import { ClientType } from '../../enums/client-type.enum';

export enum ClientSortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export class ClientQueryDto {
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

  @ApiPropertyOptional({ description: 'Case-insensitive partial search across client fields.', example: 'Ahmed' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: ClientStatus, description: 'Filter by client status.', example: ClientStatus.Active })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @ApiPropertyOptional({ enum: ClientType, description: 'Filter by client type.', example: ClientType.Individual })
  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;

  @ApiPropertyOptional({ description: 'Field to sort by.', example: 'createdAt' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sortBy?: string;

  @ApiPropertyOptional({ enum: ClientSortOrder, description: 'Sort direction.', example: ClientSortOrder.Desc, default: ClientSortOrder.Desc })
  @IsEnum(ClientSortOrder)
  @IsOptional()
  sortOrder: ClientSortOrder = ClientSortOrder.Desc;

  @ApiPropertyOptional({ description: 'Inclusive lower bound for created date.', example: '2026-01-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  createdFrom?: Date;

  @ApiPropertyOptional({ description: 'Inclusive upper bound for created date.', example: '2026-12-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  createdTo?: Date;
}
