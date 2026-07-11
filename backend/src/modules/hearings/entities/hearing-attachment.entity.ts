import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Hearing } from './hearing.entity';

@Entity(DatabaseTable.HEARING_ATTACHMENTS)
@Index('idx_hearing_attachments_hearing_id', ['hearingId'])
@Index('idx_hearing_attachments_created_at', ['createdAt'])
export class HearingAttachment extends AuditableEntity {
    @Column({ name: 'hearing_id', type: 'varchar', length: 36 })
    hearingId!: string;

    @Column({ type: 'varchar', length: 255 })
    fileName!: string;

    @Column({ name: 'file_size', type: 'int', unsigned: true })
    fileSize!: number;

    @Column({ name: 'mime_type', type: 'varchar', length: 100 })
    mimeType!: string;

    @Column({ name: 'storage_key', type: 'varchar', length: 500 })
    storageKey!: string;

    @ManyToOne(() => Hearing, (hearing) => hearing.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'hearing_id' })
    hearing!: Hearing;
}
