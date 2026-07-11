import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ClientStatus } from '../../enums/client-status.enum';
import { ClientType } from '../../enums/client-type.enum';
import { ClientAddressDto } from '../shared/client-address.dto';
import { ClientAttachmentDto } from '../shared/client-attachment.dto';
import { ClientContactDto } from '../shared/client-contact.dto';
import { ClientNoteDto } from '../shared/client-note.dto';

export class ClientResponseDto {
  @ApiProperty({ description: 'Client identifier.', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Unique client code.', example: 'CLI-000001' })
  clientCode!: string;

  @ApiProperty({ enum: ClientType, description: 'Client category.', example: ClientType.Individual })
  type!: ClientType;

  @ApiProperty({ enum: ClientStatus, description: 'Current client status.', example: ClientStatus.Active })
  status!: ClientStatus;

  @ApiPropertyOptional({ description: 'First name for individual clients.', example: 'Ahmed' })
  firstName!: string | null;

  @ApiPropertyOptional({ description: 'Last name for individual clients.', example: 'Ali' })
  lastName!: string | null;

  @ApiPropertyOptional({ description: 'Company name for organization clients.', example: 'ABC Company' })
  organizationName!: string | null;

  @ApiProperty({ description: 'Primary phone number.', example: '01012345678' })
  phone!: string;

  @ApiPropertyOptional({ description: 'Email address.', example: 'ahmed@example.com' })
  email!: string | null;

  @ApiPropertyOptional({ description: 'National ID.', example: '12345678901234' })
  nationalId!: string | null;

  @ApiPropertyOptional({ description: 'Tax number.', example: '123456789' })
  taxNumber!: string | null;

  @ApiPropertyOptional({ description: 'Commercial registration number.', example: 'CR-001' })
  commercialRegistration!: string | null;

  @ApiPropertyOptional({ description: 'Date of birth.', example: '1990-01-01' })
  dateOfBirth!: Date | null;

  @ApiPropertyOptional({ description: 'Gender.', example: 'MALE' })
  gender!: string | null;

  @ApiPropertyOptional({ description: 'Preferred language.', example: 'en' })
  preferredLanguage!: string | null;

  @ApiPropertyOptional({ description: 'Internal notes.', example: 'VIP customer' })
  notes!: string | null;

  @ApiProperty({ type: [ClientContactDto], description: 'Associated contacts.' })
  contacts!: ClientContactDto[];

  @ApiProperty({ type: [ClientAddressDto], description: 'Associated addresses.' })
  addresses!: ClientAddressDto[];

  @ApiProperty({ type: [ClientNoteDto], description: 'Associated notes.' })
  notesCollection!: ClientNoteDto[];

  @ApiProperty({ type: [ClientAttachmentDto], description: 'Associated attachments.' })
  attachments!: ClientAttachmentDto[];

  @ApiProperty({ description: 'Creation timestamp.', example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp.', example: '2026-01-02T00:00:00.000Z' })
  updatedAt!: Date;
}
