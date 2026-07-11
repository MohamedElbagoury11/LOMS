import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { ClientAttachmentType } from '../enums/client-attachment-type.enum';
import { Client } from './client.entity';

@Entity('client_attachments')
@Index('idx_client_attachments_client_id', ['clientId'])
@Index('idx_client_attachments_type', ['type'])
@Index('idx_client_attachments_uploaded_at', ['createdAt'])
export class ClientAttachment extends AuditableEntity {
    @Column({
        name: 'client_id',
        type: 'varchar',
        length: 36,
    })
    clientId!: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    fileName!: string;

    @Column({
        name: 'file_size',
        type: 'int',
        unsigned: true,
    })
    fileSize!: number;

    @Column({
        name: 'mime_type',
        type: 'varchar',
        length: 100,
    })
    mimeType!: string;

    @Column({
        name: 'storage_key',
        type: 'varchar',
        length: 500,
    })
    storageKey!: string;

    @Column({
        type: 'enum',
        enum: ClientAttachmentType,
    })
    type!: ClientAttachmentType;

    @ManyToOne(() => Client, (client) => client.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client!: Client;
}
