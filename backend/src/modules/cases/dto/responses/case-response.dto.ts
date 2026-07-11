import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CasePriority } from '../../enums/case-priority.enum';
import { CaseStatus } from '../../enums/case-status.enum';
import { CaseType } from '../../enums/case-type.enum';
import { CaseAttachmentDto } from '../shared/case-attachment.dto';
import { CaseClientDto } from '../shared/case-client.dto';
import { CaseLawyerDto } from '../shared/case-lawyer.dto';
import { CaseNoteDto } from '../shared/case-note.dto';
import { CaseOppositePartyDto } from '../shared/case-opposite-party.dto';

export class CaseResponseDto {
  @ApiProperty({ description: 'Case identifier.', example: '550e8400-e29b-41d4-a716-446655440010' })
  id!: string;

  @ApiProperty({ description: 'Unique case number.', example: 'CASE-2026-000001' })
  caseNumber!: string;

  @ApiProperty({ description: 'Case title.', example: 'Contract dispute with ABC Ltd' })
  title!: string;

  @ApiPropertyOptional({ description: 'Case description.', example: 'Dispute over delayed payment and contract termination.' })
  description!: string | null;

  @ApiProperty({ enum: CaseStatus, description: 'Current case status.', example: CaseStatus.Open })
  status!: CaseStatus;

  @ApiProperty({ enum: CaseType, description: 'Case type.', example: CaseType.Commercial })
  type!: CaseType;

  @ApiPropertyOptional({ description: 'Court name.', example: 'Cairo Economic Court' })
  courtName!: string | null;

  @ApiPropertyOptional({ description: 'Court circuit or chamber.', example: 'First Circuit' })
  courtCircuit!: string | null;

  @ApiPropertyOptional({ description: 'Judge name.', example: 'Judge Mahmoud Eid' })
  judgeName!: string | null;

  @ApiPropertyOptional({ description: 'Filing date.', example: '2026-01-15' })
  filingDate!: Date | null;

  @ApiPropertyOptional({ description: 'Opening date.', example: '2026-01-20' })
  openingDate!: Date | null;

  @ApiPropertyOptional({ description: 'Closing date.', example: '2026-06-01' })
  closingDate!: Date | null;

  @ApiProperty({ enum: CasePriority, description: 'Case priority.', example: CasePriority.High })
  priority!: CasePriority;

  @ApiProperty({ type: [CaseClientDto], description: 'Clients associated with the case.' })
  clients!: CaseClientDto[];

  @ApiProperty({ type: [CaseLawyerDto], description: 'Lawyers assigned to the case.' })
  lawyers!: CaseLawyerDto[];

  @ApiProperty({ type: [CaseOppositePartyDto], description: 'Opposite parties linked to the case.' })
  oppositeParties!: CaseOppositePartyDto[];

  @ApiProperty({ type: [CaseNoteDto], description: 'Internal notes attached to the case.' })
  notes!: CaseNoteDto[];

  @ApiProperty({ type: [CaseAttachmentDto], description: 'Attachments attached to the case.' })
  attachments!: CaseAttachmentDto[];

  @ApiProperty({ description: 'Creation timestamp.', example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp.', example: '2026-01-02T00:00:00.000Z' })
  updatedAt!: Date;
}
