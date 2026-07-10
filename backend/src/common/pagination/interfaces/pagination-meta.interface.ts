import { SortDirection } from '../../enums/sort-direction.enum';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  sortBy?: string;
  sortDirection: SortDirection;
}
