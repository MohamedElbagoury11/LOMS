import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseLawyerDto {
  @ApiProperty({ description: 'Case-lawyer relationship identifier.', example: '550e8400-e29b-41d4-a716-446655440011' })
  id!: string;

  @ApiProperty({ description: 'Lawyer user identifier assigned to the case.', example: '550e8400-e29b-41d4-a716-446655440001' })
  userId!: string;

  @ApiProperty({ description: 'Indicates whether this lawyer is the primary lawyer.', example: true })
  isPrimary!: boolean;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
