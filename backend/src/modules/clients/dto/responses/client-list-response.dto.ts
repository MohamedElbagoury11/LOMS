import { ApiProperty } from '@nestjs/swagger';

import { ClientResponseDto } from './client-response.dto';

export class ClientListResponseDto {
  @ApiProperty({ type: [ClientResponseDto], description: 'Collection of clients.' })
  items!: ClientResponseDto[];

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
