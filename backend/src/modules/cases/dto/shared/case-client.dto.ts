import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseClientDto {
  @ApiProperty({ description: 'Client identifier.', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Client identifier linked to the case.', example: '550e8400-e29b-41d4-a716-446655440000' })
  clientId!: string;

  @ApiProperty({ description: 'Indicates whether this client is the primary client.', example: true })
  isPrimary!: boolean;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
