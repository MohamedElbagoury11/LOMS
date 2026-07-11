import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Case } from './case.entity';

@Entity(DatabaseTable.CASE_OPPOSITE_PARTIES)
@Index('idx_case_opposite_parties_case_id', ['caseId'])
export class CaseOppositeParty extends AuditableEntity {
    @Column({ name: 'case_id', type: 'varchar', length: 36 })
    caseId!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    role!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    organizationName!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    phone!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email!: string | null;

    @ManyToOne(() => Case, (c) => c.oppositeParties, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'case_id' })
    case!: Case;
}
