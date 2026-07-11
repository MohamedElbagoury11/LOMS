import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentShareResponseDto {
    @ApiProperty({ description: 'Unique share identifier.', example: '550e8400-e29b-41d4-a716-446655440030' })
    id!: string;

    @ApiProperty({ description: 'Identifier of the shared document.', example: '550e8400-e29b-41d4-a716-446655440020' })
    documentId!: string;

    @ApiProperty({ description: 'Secure share token.', example: 'XfC0b7b4i6C4qkL9Rq0u9N8jK1e0P3Q4hF2G5E6S7T8U9V0W' })
    token!: string;

    @ApiProperty({ description: 'Share link expiration datetime.', example: '2026-07-18T12:00:00.000Z' })
    expiresAt!: Date;

    @ApiPropertyOptional({ description: 'Revocation datetime if the link has been revoked.', example: '2026-07-12T15:00:00.000Z' })
    revokedAt!: Date | null;

    @ApiPropertyOptional({ description: 'Identifier of the user who created the share link.', example: '550e8400-e29b-41d4-a716-446655440001' })
    createdBy!: string | null;

    @ApiProperty({ description: 'Share creation datetime.', example: '2026-07-11T10:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ description: 'Last update datetime for the share link.', example: '2026-07-11T10:00:00.000Z' })
    updatedAt!: Date;
}
