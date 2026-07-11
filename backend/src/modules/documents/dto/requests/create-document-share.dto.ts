import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateDocumentShareDto {
    @ApiProperty({ description: 'Share link expiration datetime in ISO 8601 format.', example: '2026-07-18T12:00:00.000Z' })
    @IsDateString()
    expiresAt!: string;
}
