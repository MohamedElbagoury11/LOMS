import { SortDirection } from '../../enums/sort-direction.enum';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy?: string;
  sortDirection: SortDirection;
}
