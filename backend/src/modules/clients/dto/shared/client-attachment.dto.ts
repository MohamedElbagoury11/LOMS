import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';

import { ClientAttachmentType } from '../../enums/client-attachment-type.enum';

export class ClientAttachmentDto {
  @ApiProperty({ description: 'Attachment identifier.', example: '550e8400-e29b-41d4-a716-446655440003' })
  id!: string;

  @ApiProperty({ description: 'Original file name.', example: 'passport.pdf' })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({ description: 'File size in bytes.', example: 204800 })
  @IsInt()
  @Min(0)
  fileSize!: number;

  @ApiProperty({ description: 'MIME type.', example: 'application/pdf' })
  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @ApiProperty({ description: 'Storage key for the uploaded file.', example: 'clients/abc/passport.pdf' })
  @IsString()
  @MaxLength(500)
  storageKey!: string;

  @ApiProperty({ enum: ClientAttachmentType, description: 'Attachment category.', example: ClientAttachmentType.Passport })
  @IsEnum(ClientAttachmentType)
  type!: ClientAttachmentType;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
