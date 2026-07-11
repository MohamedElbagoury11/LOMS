import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { HearingResult } from '../../enums/hearing-result.enum';
import { HearingStatus } from '../../enums/hearing-status.enum';
import { HearingAttachmentDto } from '../shared/hearing-attachment.dto';
import { HearingNoteDto } from '../shared/hearing-note.dto';

export class HearingResponseDto {
  @ApiProperty({ description: 'Hearing identifier.', example: '550e8400-e29b-41d4-a716-446655440030' })
  id!: string;

  @ApiProperty({ description: 'Unique hearing number.', example: 'HEARING-2026-000001' })
  hearingNumber!: string;

  @ApiProperty({ description: 'Case identifier.', example: '550e8400-e29b-41d4-a716-446655440010' })
  caseId!: string;

  @ApiPropertyOptional({ description: 'Court name.', example: 'Cairo Economic Court' })
  courtName!: string | null;

  @ApiPropertyOptional({ description: 'Court chamber.', example: 'First Chamber' })
  chamber!: string | null;

  @ApiPropertyOptional({ description: 'Hearing date.', example: '2026-07-20' })
  hearingDate!: Date | null;

  @ApiPropertyOptional({ description: 'Hearing time.', example: '14:30:00' })
  hearingTime!: string | null;

  @ApiProperty({ enum: HearingStatus, description: 'Current hearing status.', example: HearingStatus.Scheduled })
  status!: HearingStatus;

  @ApiProperty({ enum: HearingResult, description: 'Current hearing result.', example: HearingResult.Pending })
  result!: HearingResult;

  @ApiPropertyOptional({ description: 'Judge name.', example: 'Judge Mahmoud Eid' })
  judgeName!: string | null;

  @ApiPropertyOptional({ description: 'Notes associated with the hearing.', example: 'Client requested a revised submission timeline.' })
  notes!: string | null;

  @ApiPropertyOptional({ description: 'Next hearing date.', example: '2026-08-10' })
  nextHearingDate!: Date | null;

  @ApiProperty({ type: [HearingNoteDto], description: 'Notes attached to the hearing.' })
  notesCollection!: HearingNoteDto[];

  @ApiProperty({ type: [HearingAttachmentDto], description: 'Attachments attached to the hearing.' })
  attachments!: HearingAttachmentDto[];

  @ApiProperty({ description: 'Creation timestamp.', example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp.', example: '2026-01-02T00:00:00.000Z' })
  updatedAt!: Date;
}
