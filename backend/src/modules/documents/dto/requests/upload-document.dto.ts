import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UploadDocumentDto {
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

    @ApiPropertyOptional({ description: 'Optional document description.', example: 'Primary registration certificate for the client.' })
    @IsOptional()
    @IsString()
    @MaxLength(10000)
    description?: string;
}
