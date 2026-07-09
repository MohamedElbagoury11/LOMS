import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_PAGE_SIZE,
} from '../constants/pagination.constants';
import { SortDirection } from '../enums/sort-direction.enum';
import { PaginationDto } from './dto/pagination.dto';
import { PaginationMeta } from './interfaces/pagination-meta.interface';
import { PaginationResult } from './interfaces/pagination-result.interface';

interface NormalizedPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection: SortDirection;
}

export class PaginationHelper {
  static normalize(options: PaginationDto): NormalizedPaginationOptions {
    const page = Math.max(options.page, PAGINATION_DEFAULT_PAGE);
    const requestedLimit = options.limit;
    const limit = Math.min(Math.max(requestedLimit, 1), PAGINATION_MAX_PAGE_SIZE);

    return {
      page,
      limit,
      sortBy: options.sortBy,
      sortDirection: options.sortDirection,
    };
  }

  static getSkip(options: PaginationDto): number {
    const normalized = PaginationHelper.normalize(options);

    return (normalized.page - 1) * normalized.limit;
  }

  static createMeta(options: PaginationDto, totalItems: number): PaginationMeta {
    const normalized = PaginationHelper.normalize(options);
    const totalPages = Math.ceil(totalItems / normalized.limit);

    return {
      page: normalized.page,
      limit: normalized.limit,
      totalItems,
      totalPages,
      hasNextPage: normalized.page < totalPages,
      hasPreviousPage: normalized.page > 1,
      sortBy: normalized.sortBy,
      sortDirection: normalized.sortDirection,
    };
  }

  static createResult<TItem>(
    items: TItem[],
    totalItems: number,
    options: PaginationDto,
  ): PaginationResult<TItem> {
    return {
      items,
      meta: PaginationHelper.createMeta(options, totalItems),
    };
  }
}
