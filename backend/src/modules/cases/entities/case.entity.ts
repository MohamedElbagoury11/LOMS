import { Column, Entity, Index, OneToMany } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { CasePriority } from '../enums/case-priority.enum';
import { CaseStatus } from '../enums/case-status.enum';
import { CaseType } from '../enums/case-type.enum';
import { CaseAttachment } from './case-attachment.entity';
import { CaseClient } from './case-client.entity';
import { CaseLawyer } from './case-lawyer.entity';
import { CaseNote } from './case-note.entity';
import { CaseOppositeParty } from './case-opposite-party.entity';

@Entity(DatabaseTable.CASES)
@Index('UQ_cases_case_number', ['caseNumber'], { unique: true })
@Index('idx_cases_status', ['status'])
@Index('idx_cases_type', ['type'])
@Index('idx_cases_priority', ['priority'])
@Index('idx_cases_created_at', ['createdAt'])
export class Case extends AuditableEntity {
    @Column({ name: 'case_number', type: 'varchar', length: 30, unique: true })
    caseNumber!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.Draft })
    status!: CaseStatus;

    @Column({ type: 'enum', enum: CaseType, default: CaseType.Custom })
    type!: CaseType;

    @Column({ type: 'varchar', length: 255, nullable: true })
    courtName!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    courtCircuit!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    judgeName!: string | null;

    @Column({ name: 'filing_date', type: 'date', nullable: true })
    filingDate!: Date | null;

    @Column({ name: 'opening_date', type: 'date', nullable: true })
    openingDate!: Date | null;

    @Column({ name: 'closing_date', type: 'date', nullable: true })
    closingDate!: Date | null;

    @Column({ type: 'enum', enum: CasePriority, default: CasePriority.Medium })
    priority!: CasePriority;

    @OneToMany(() => CaseClient, (caseClient) => caseClient.case)
    caseClients!: CaseClient[];

    @OneToMany(() => CaseLawyer, (caseLawyer) => caseLawyer.case)
    caseLawyers!: CaseLawyer[];

    @OneToMany(() => CaseOppositeParty, (party) => party.case)
    oppositeParties!: CaseOppositeParty[];

    @OneToMany(() => CaseNote, (note) => note.case)
    notes!: CaseNote[];

    @OneToMany(() => CaseAttachment, (attachment) => attachment.case)
    attachments!: CaseAttachment[];
}
