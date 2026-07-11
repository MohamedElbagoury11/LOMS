import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Hearing } from './hearing.entity';

@Entity(DatabaseTable.HEARING_NOTES)
@Index('idx_hearing_notes_hearing_id', ['hearingId'])
@Index('idx_hearing_notes_created_at', ['createdAt'])
export class HearingNote extends AuditableEntity {
    @Column({ name: 'hearing_id', type: 'varchar', length: 36 })
    hearingId!: string;

    @Column({ type: 'text' })
    content!: string;

    @ManyToOne(() => Hearing, (hearing) => hearing.notesCollection, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'hearing_id' })
    hearing!: Hearing;
}
