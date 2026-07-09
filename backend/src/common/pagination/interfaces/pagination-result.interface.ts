import { PaginationMeta } from './pagination-meta.interface';

export interface PaginationResult<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}
