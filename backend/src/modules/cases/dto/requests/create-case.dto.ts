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

import { CasePriority } from '../../enums/case-priority.enum';
import { CaseStatus } from '../../enums/case-status.enum';
import { CaseType } from '../../enums/case-type.enum';
import { CaseAttachmentDto } from '../shared/case-attachment.dto';
import { CaseNoteDto } from '../shared/case-note.dto';
import { CaseOppositePartyDto } from '../shared/case-opposite-party.dto';

export class CreateCaseDto {
  @ApiProperty({ description: 'Unique case number.', example: 'CASE-2026-000001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  caseNumber!: string;

  @ApiProperty({ description: 'Case title.', example: 'Contract dispute with ABC Ltd' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Detailed case description.', example: 'Dispute over delayed payment and contract termination.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({ enum: CaseStatus, description: 'Case lifecycle status.', example: CaseStatus.Draft })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({ enum: CaseType, description: 'Case category.', example: CaseType.Commercial })
  @IsOptional()
  @IsEnum(CaseType)
  type?: CaseType;

  @ApiPropertyOptional({ description: 'Court name.', example: 'Cairo Economic Court' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  courtName?: string;

  @ApiPropertyOptional({ description: 'Court circuit or chamber.', example: 'First Circuit' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  courtCircuit?: string;

  @ApiPropertyOptional({ description: 'Judge name.', example: 'Judge Mahmoud Eid' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  judgeName?: string;

  @ApiPropertyOptional({ description: 'Filing date in ISO format.', example: '2026-01-15' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  filingDate?: Date;

  @ApiPropertyOptional({ description: 'Opening date in ISO format.', example: '2026-01-20' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  openingDate?: Date;

  @ApiPropertyOptional({ description: 'Closing date in ISO format.', example: '2026-06-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  closingDate?: Date;

  @ApiPropertyOptional({ enum: CasePriority, description: 'Case priority.', example: CasePriority.High })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiProperty({ type: [String], description: 'List of client identifiers to associate with the case.', example: ['550e8400-e29b-41d4-a716-446655440000'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  clientIds!: string[];

  @ApiProperty({ type: [String], description: 'List of lawyer user identifiers to associate with the case.', example: ['550e8400-e29b-41d4-a716-446655440001'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  lawyerIds!: string[];

  @ApiPropertyOptional({ type: [CaseOppositePartyDto], description: 'Opposite parties linked to the case.' })
  @IsOptional()
  @IsArray()
  oppositeParties?: CaseOppositePartyDto[];

  @ApiPropertyOptional({ type: [CaseNoteDto], description: 'Initial internal notes for the case.' })
  @IsOptional()
  @IsArray()
  notes?: CaseNoteDto[];

  @ApiPropertyOptional({ type: [CaseAttachmentDto], description: 'Initial attachments for the case.' })
  @IsOptional()
  @IsArray()
  attachments?: CaseAttachmentDto[];
}
