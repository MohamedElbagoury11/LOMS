import { ApiProperty } from '@nestjs/swagger';

import { HearingResponseDto } from './hearing-response.dto';

export class HearingListResponseDto {
  @ApiProperty({ type: [HearingResponseDto], description: 'Collection of hearings.' })
  items!: HearingResponseDto[];

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
