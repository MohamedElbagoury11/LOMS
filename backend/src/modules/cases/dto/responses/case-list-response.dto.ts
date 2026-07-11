import { ApiProperty } from '@nestjs/swagger';

import { CaseResponseDto } from './case-response.dto';

export class CaseListResponseDto {
  @ApiProperty({ type: [CaseResponseDto], description: 'Collection of cases.' })
  items!: CaseResponseDto[];

  @ApiProperty({ description: 'Pagination metadata for the result set.' })
  meta!: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    sortBy?: string;
    sortDirection: string;
  };
}
