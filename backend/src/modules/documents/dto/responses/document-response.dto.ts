import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Unique document identifier.', example: '550e8400-e29b-41d4-a716-446655440020' })
  id!: string;

  @ApiProperty({ description: 'Owning client identifier.', example: '550e8400-e29b-41d4-a716-446655440000' })
  clientId!: string;

  @ApiPropertyOptional({ description: 'Associated case identifier, if present.', example: '550e8400-e29b-41d4-a716-446655440010' })
  caseId!: string | null;

  @ApiProperty({ description: 'User-facing document name.', example: 'Commercial Registration' })
  displayName!: string;

  @ApiProperty({ description: 'Original uploaded file name.', example: 'commercial-registration.pdf' })
  originalFileName!: string;

  @ApiProperty({ description: 'File extension.', example: 'pdf' })
  extension!: string;

  @ApiProperty({ description: 'MIME type of the uploaded file.', example: 'application/pdf' })
  mimeType!: string;

  @ApiProperty({ description: 'File size in bytes.', example: 245760 })
  fileSize!: number;

  @ApiPropertyOptional({ description: 'Optional document description.', example: 'Primary registration certificate for the client.' })
  description!: string | null;

  @ApiProperty({ description: 'Archive status.', example: false })
  archived!: boolean;

  @ApiPropertyOptional({ description: 'User who uploaded the document.', example: '550e8400-e29b-41d4-a716-446655440001' })
  uploadedBy!: string | null;

  @ApiProperty({ description: 'Upload timestamp.', example: '2026-07-11T10:00:00.000Z' })
  uploadedAt!: Date;

  @ApiProperty({ description: 'Last update timestamp.', example: '2026-07-11T10:00:00.000Z' })
  updatedAt!: Date;
}
