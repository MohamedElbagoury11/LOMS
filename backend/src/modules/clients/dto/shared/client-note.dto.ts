import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ClientNoteDto {
  @ApiProperty({ description: 'Note identifier.', example: '550e8400-e29b-41d4-a716-446655440004' })
  id!: string;

  @ApiProperty({ description: 'Internal note content.', example: 'Follow up on the contract renewal.' })
  @IsString()
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
