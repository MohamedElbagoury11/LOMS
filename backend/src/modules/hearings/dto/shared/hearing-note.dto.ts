import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HearingNoteDto {
  @ApiProperty({ description: 'Note identifier.', example: '550e8400-e29b-41d4-a716-446655440020' })
  id!: string;

  @ApiProperty({ description: 'Note content.', example: 'The client requested a revised submission timeline.' })
  content!: string;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
