import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseNoteDto {
  @ApiProperty({ description: 'Note identifier.', example: '550e8400-e29b-41d4-a716-446655440013' })
  id!: string;

  @ApiProperty({ description: 'Note content.', example: 'Client requested a status update.' })
  content!: string;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
