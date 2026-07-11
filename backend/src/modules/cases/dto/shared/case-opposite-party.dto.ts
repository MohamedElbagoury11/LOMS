import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseOppositePartyDto {
  @ApiProperty({ description: 'Opposite party identifier.', example: '550e8400-e29b-41d4-a716-446655440012' })
  id!: string;

  @ApiProperty({ description: 'Opposite party full name.', example: 'John Smith' })
  name!: string;

  @ApiPropertyOptional({ description: 'Role or relationship.', example: 'Counterparty' })
  role?: string | null;

  @ApiPropertyOptional({ description: 'Organization name, when applicable.', example: 'Smith Holdings' })
  organizationName?: string | null;

  @ApiPropertyOptional({ description: 'Phone number.', example: '01012345678' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Email address.', example: 'john@example.com' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
