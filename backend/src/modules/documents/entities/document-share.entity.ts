import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Document } from './document.entity';

@Entity(DatabaseTable.DOCUMENT_SHARES)
@Index('idx_document_shares_token', ['token'], { unique: true })
@Index('idx_document_shares_document_id', ['documentId'])
@Index('idx_document_shares_expires_at', ['expiresAt'])
@Index('idx_document_shares_revoked_at', ['revokedAt'])
export class DocumentShare extends AuditableEntity {
    @Column({ name: 'document_id', type: 'varchar', length: 36 })
    documentId!: string;

    @ManyToOne(() => Document, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'document_id' })
    document!: Document;

    @Column({ type: 'varchar', length: 128, unique: true })
    token!: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt!: Date;

    @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
    revokedAt!: Date | null;
}
