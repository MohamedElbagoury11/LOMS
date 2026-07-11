import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Case } from './case.entity';

@Entity(DatabaseTable.CASE_ATTACHMENTS)
@Index('idx_case_attachments_case_id', ['caseId'])
@Index('idx_case_attachments_created_at', ['createdAt'])
export class CaseAttachment extends AuditableEntity {
    @Column({ name: 'case_id', type: 'varchar', length: 36 })
    caseId!: string;

    @Column({ type: 'varchar', length: 255 })
    fileName!: string;

    @Column({ name: 'file_size', type: 'int', unsigned: true })
    fileSize!: number;

    @Column({ name: 'mime_type', type: 'varchar', length: 100 })
    mimeType!: string;

    @Column({ name: 'storage_key', type: 'varchar', length: 500 })
    storageKey!: string;

    @ManyToOne(() => Case, (c) => c.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'case_id' })
    case!: Case;
}
