import { ApiProperty } from '@nestjs/swagger';

import { DocumentResponseDto } from './document-response.dto';

export class DocumentListResponseDto {
  @ApiProperty({ description: 'List of documents.', type: [DocumentResponseDto] })
  items!: DocumentResponseDto[];

  @ApiProperty({ description: 'Total number of documents matching the filter.', example: 1 })
  total!: number;

  @ApiProperty({ description: 'Current page number.', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Number of items per page.', example: 20 })
  limit!: number;
}
