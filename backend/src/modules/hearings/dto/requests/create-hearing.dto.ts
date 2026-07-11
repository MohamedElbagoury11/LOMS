import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

import { HearingResult } from '../../enums/hearing-result.enum';
import { HearingStatus } from '../../enums/hearing-status.enum';
import { HearingAttachmentDto } from '../shared/hearing-attachment.dto';
import { HearingNoteDto } from '../shared/hearing-note.dto';

export class CreateHearingDto {
  @ApiProperty({ description: 'Unique hearing number.', example: 'HEARING-2026-000001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  hearingNumber!: string;

  @ApiProperty({ description: 'Case identifier for the hearing.', example: '550e8400-e29b-41d4-a716-446655440010' })
  @IsUUID()
  caseId!: string;

  @ApiPropertyOptional({ description: 'Court name.', example: 'Cairo Economic Court' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  courtName?: string;

  @ApiPropertyOptional({ description: 'Court chamber.', example: 'First Chamber' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  chamber?: string;

  @ApiPropertyOptional({ description: 'Hearing date in ISO format.', example: '2026-07-20' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  hearingDate?: Date;

  @ApiPropertyOptional({ description: 'Hearing time in ISO format.', example: '14:30:00' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  hearingTime?: string;

  @ApiPropertyOptional({ enum: HearingStatus, description: 'Current hearing status.', example: HearingStatus.Scheduled })
  @IsOptional()
  @IsEnum(HearingStatus)
  status?: HearingStatus;

  @ApiPropertyOptional({ enum: HearingResult, description: 'Current hearing result.', example: HearingResult.Pending })
  @IsOptional()
  @IsEnum(HearingResult)
  result?: HearingResult;

  @ApiPropertyOptional({ description: 'Judge name.', example: 'Judge Mahmoud Eid' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  judgeName?: string;

  @ApiPropertyOptional({ description: 'Additional hearing notes.', example: 'Client requested a full review of evidence.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Next hearing date in ISO format.', example: '2026-08-10' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  nextHearingDate?: Date;

  @ApiPropertyOptional({ type: [HearingNoteDto], description: 'Initial hearing notes.' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  notesCollection?: HearingNoteDto[];

  @ApiPropertyOptional({ type: [HearingAttachmentDto], description: 'Initial hearing attachments.' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  attachments?: HearingAttachmentDto[];
}
