import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Case } from './case.entity';

@Entity(DatabaseTable.CASE_NOTES)
@Index('idx_case_notes_case_id', ['caseId'])
@Index('idx_case_notes_created_at', ['createdAt'])
export class CaseNote extends AuditableEntity {
    @Column({ name: 'case_id', type: 'varchar', length: 36 })
    caseId!: string;

    @Column({ type: 'text' })
    content!: string;

    @ManyToOne(() => Case, (c) => c.notes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'case_id' })
    case!: Case;
}
