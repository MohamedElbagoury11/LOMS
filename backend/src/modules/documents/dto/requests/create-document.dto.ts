import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Identifier of the owning client.', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  clientId!: string;

  @ApiPropertyOptional({ description: 'Optional related case identifier.', example: '550e8400-e29b-41d4-a716-446655440010' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiProperty({ description: 'User-facing document name.', example: 'Commercial Registration' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName!: string;

  @ApiProperty({ description: 'Original uploaded file name.', example: 'commercial-registration.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalFileName!: string;

  @ApiProperty({ description: 'File extension.', example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  extension!: string;

  @ApiProperty({ description: 'MIME type of the uploaded file.', example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mimeType!: string;

  @ApiProperty({ description: 'File size in bytes.', example: 245760 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fileSize!: number;

  @ApiProperty({ description: 'Physical storage identifier.', example: 'uploads/clients/550e8400-e29b-41d4-a716-446655440000/documents/abc123.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  storageKey!: string;

  @ApiPropertyOptional({ description: 'Optional document description.', example: 'Primary registration certificate for the client.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;
}
