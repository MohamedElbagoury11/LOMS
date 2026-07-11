import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HearingAttachmentDto {
  @ApiProperty({ description: 'Attachment identifier.', example: '550e8400-e29b-41d4-a716-446655440021' })
  id!: string;

  @ApiProperty({ description: 'Original file name.', example: 'hearing-notice.pdf' })
  fileName!: string;

  @ApiProperty({ description: 'File size in bytes.', example: 184320 })
  fileSize!: number;

  @ApiProperty({ description: 'MIME type.', example: 'application/pdf' })
  mimeType!: string;

  @ApiPropertyOptional({ description: 'Storage key or object identifier.' })
  storageKey?: string;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
