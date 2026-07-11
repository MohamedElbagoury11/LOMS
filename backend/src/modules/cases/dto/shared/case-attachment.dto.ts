import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseAttachmentDto {
  @ApiProperty({ description: 'Attachment identifier.', example: '550e8400-e29b-41d4-a716-446655440014' })
  id!: string;

  @ApiProperty({ description: 'Original file name.', example: 'contract.pdf' })
  fileName!: string;

  @ApiProperty({ description: 'File size in bytes.', example: 204800 })
  fileSize!: number;

  @ApiProperty({ description: 'MIME type.', example: 'application/pdf' })
  mimeType!: string;

  @ApiPropertyOptional({ description: 'Storage key or object identifier.' })
  storageKey?: string;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
