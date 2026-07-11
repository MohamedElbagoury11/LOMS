import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { Client } from './client.entity';

@Entity('client_contacts')
@Index('idx_client_contacts_client_id', ['clientId'])
@Index('idx_client_contacts_is_primary', ['isPrimary'])
@Index('idx_client_contacts_email', ['email'])
@Index('idx_client_contacts_phone', ['phone'])
export class ClientContact extends AuditableEntity {
    @Column({
        name: 'client_id',
        type: 'varchar',
        length: 36,
    })
    clientId!: string;

    @Column({
        type: 'varchar',
        length: 150,
    })
    name!: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    position!: string | null;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    phone!: string | null;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    email!: string | null;

    @Column({
        name: 'is_primary',
        type: 'boolean',
        default: false,
    })
    isPrimary!: boolean;

    @ManyToOne(() => Client, (client) => client.contacts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client!: Client;
}
