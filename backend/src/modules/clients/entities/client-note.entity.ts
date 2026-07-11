import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { Client } from './client.entity';

@Entity('client_notes')
@Index('idx_client_notes_client_id', ['clientId'])
@Index('idx_client_notes_created_at', ['createdAt'])
export class ClientNote extends AuditableEntity {
    @Column({
        name: 'client_id',
        type: 'varchar',
        length: 36,
    })
    clientId!: string;

    @Column({
        type: 'text',
    })
    content!: string;

    @ManyToOne(() => Client, (client) => client.notesCollection, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client!: Client;
}
