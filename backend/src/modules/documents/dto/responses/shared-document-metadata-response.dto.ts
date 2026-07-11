import { ApiProperty } from '@nestjs/swagger';

export class SharedDocumentMetadataResponseDto {
    @ApiProperty({ description: 'User-facing document name.', example: 'Commercial Registration' })
    displayName!: string;

    @ApiProperty({ description: 'Original uploaded file name.', example: 'commercial-registration.pdf' })
    originalFileName!: string;

    @ApiProperty({ description: 'File size in bytes.', example: 245760 })
    fileSize!: number;

    @ApiProperty({ description: 'MIME type of the uploaded file.', example: 'application/pdf' })
    mimeType!: string;

    @ApiProperty({ description: 'Share link expiration datetime.', example: '2026-07-18T12:00:00.000Z' })
    expiresAt!: Date;

    @ApiProperty({ description: 'Share creation datetime.', example: '2026-07-11T10:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ description: 'Indicates whether document preview is supported through this share link.', example: true })
    previewSupported!: boolean;

    @ApiProperty({ description: 'Indicates whether document download is supported through this share link.', example: true })
    downloadSupported!: boolean;
}
