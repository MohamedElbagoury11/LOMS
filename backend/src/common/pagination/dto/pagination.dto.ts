import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import {
  DEFAULT_SORT_DIRECTION,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_MAX_PAGE_SIZE,
} from '../../constants/pagination.constants';
import { SortDirection } from '../../enums/sort-direction.enum';

export class PaginationDto {
  @ApiPropertyOptional({
    example: PAGINATION_DEFAULT_PAGE,
    default: PAGINATION_DEFAULT_PAGE,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = PAGINATION_DEFAULT_PAGE;

  @ApiPropertyOptional({
    example: PAGINATION_DEFAULT_PAGE_SIZE,
    default: PAGINATION_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: PAGINATION_MAX_PAGE_SIZE,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_PAGE_SIZE)
  @IsOptional()
  limit: number = PAGINATION_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field name to sort by.',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: SortDirection,
    default: DEFAULT_SORT_DIRECTION,
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = DEFAULT_SORT_DIRECTION;
}
