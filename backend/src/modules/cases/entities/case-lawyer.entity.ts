import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Case } from './case.entity';

@Entity(DatabaseTable.CASE_LAWYERS)
@Index('UQ_case_lawyers_case_user', ['caseId', 'userId'], { unique: true })
@Index('idx_case_lawyers_case_id', ['caseId'])
@Index('idx_case_lawyers_user_id', ['userId'])
export class CaseLawyer extends AuditableEntity {
    @Column({ name: 'case_id', type: 'varchar', length: 36 })
    caseId!: string;

    @Column({ name: 'user_id', type: 'varchar', length: 36 })
    userId!: string;

    @Column({ name: 'is_primary', type: 'boolean', default: false })
    isPrimary!: boolean;

    @ManyToOne(() => Case, (c) => c.caseLawyers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'case_id' })
    case!: Case;
}
