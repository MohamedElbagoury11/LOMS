import { ApiProperty } from '@nestjs/swagger';

import { DocumentShareResponseDto } from './document-share-response.dto';

export class DocumentShareListResponseDto {
    @ApiProperty({ description: 'List of document share links.', type: [DocumentShareResponseDto] })
    items!: DocumentShareResponseDto[];

    @ApiProperty({ description: 'Total number of share links.', example: 1 })
    total!: number;

    @ApiProperty({ description: 'Current page number.', example: 1 })
    page!: number;

    @ApiProperty({ description: 'Number of items per page.', example: 20 })
    limit!: number;
}
