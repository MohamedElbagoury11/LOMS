import { ApiProperty } from '@nestjs/swagger';

import { AuditResponseDto } from './audit-response.dto';

export class AuditListResponseDto {
    @ApiProperty({ type: [AuditResponseDto], description: 'Collection of audit records.' })
    items!: AuditResponseDto[];

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
