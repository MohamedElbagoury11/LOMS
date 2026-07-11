import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Case } from '../../cases/entities/case.entity';
import { HearingResult } from '../enums/hearing-result.enum';
import { HearingStatus } from '../enums/hearing-status.enum';
import { HearingAttachment } from './hearing-attachment.entity';
import { HearingNote } from './hearing-note.entity';

@Entity(DatabaseTable.HEARINGS)
@Index('UQ_hearings_hearing_number', ['hearingNumber'], { unique: true })
@Index('idx_hearings_case_id', ['caseId'])
@Index('idx_hearings_hearing_date', ['hearingDate'])
@Index('idx_hearings_status', ['status'])
@Index('idx_hearings_result', ['result'])
@Index('idx_hearings_created_at', ['createdAt'])
export class Hearing extends AuditableEntity {
    @Column({ name: 'hearing_number', type: 'varchar', length: 30, unique: true })
    hearingNumber!: string;

    @Column({ name: 'case_id', type: 'varchar', length: 36 })
    caseId!: string;

    @Column({ name: 'court_name', type: 'varchar', length: 255, nullable: true })
    courtName!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    chamber!: string | null;

    @Column({ name: 'hearing_date', type: 'date', nullable: true })
    hearingDate!: Date | null;

    @Column({ name: 'hearing_time', type: 'time', nullable: true })
    hearingTime!: string | null;

    @Column({ type: 'enum', enum: HearingStatus, default: HearingStatus.Scheduled })
    status!: HearingStatus;

    @Column({ type: 'enum', enum: HearingResult, default: HearingResult.Pending })
    result!: HearingResult;

    @Column({ name: 'judge_name', type: 'varchar', length: 255, nullable: true })
    judgeName!: string | null;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @Column({ name: 'next_hearing_date', type: 'date', nullable: true })
    nextHearingDate!: Date | null;

    @ManyToOne(() => Case, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'case_id' })
    case!: Case;

    @OneToMany(() => HearingNote, (note) => note.hearing)
    notesCollection!: HearingNote[];

    @OneToMany(() => HearingAttachment, (attachment) => attachment.hearing)
    attachments!: HearingAttachment[];
}
