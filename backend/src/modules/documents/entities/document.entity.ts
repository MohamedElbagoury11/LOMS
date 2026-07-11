import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Case } from '../../cases/entities/case.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity(DatabaseTable.DOCUMENTS)
@Index('idx_documents_client_id', ['clientId'])
@Index('idx_documents_case_id', ['caseId'])
@Index('idx_documents_display_name', ['displayName'])
export class Document extends AuditableEntity {
    @Column({ name: 'client_id', type: 'varchar', length: 36 })
    clientId!: string;

    @Column({ name: 'case_id', type: 'varchar', length: 36, nullable: true })
    caseId!: string | null;

    @Column({ name: 'display_name', type: 'varchar', length: 255 })
    displayName!: string;

    @Column({ name: 'original_file_name', type: 'varchar', length: 255 })
    originalFileName!: string;

    @Column({ type: 'varchar', length: 50 })
    extension!: string;

    @Column({ name: 'mime_type', type: 'varchar', length: 100 })
    mimeType!: string;

    @Column({ name: 'file_size', type: 'int', unsigned: true })
    fileSize!: number;

    @Column({ name: 'storage_key', type: 'varchar', length: 500 })
    storageKey!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @ManyToOne(() => Client, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'client_id' })
    client!: Client;

    @ManyToOne(() => Case, { nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'case_id' })
    case!: Case | null;
}
