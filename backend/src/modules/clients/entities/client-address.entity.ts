import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { Client } from './client.entity';

@Entity('client_addresses')
@Index('idx_client_addresses_client_id', ['clientId'])
@Index('idx_client_addresses_is_primary', ['isPrimary'])
export class ClientAddress extends AuditableEntity {
    @Column({
        name: 'client_id',
        type: 'varchar',
        length: 36,
    })
    clientId!: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    country!: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    city!: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    district!: string | null;

    @Column({
        type: 'varchar',
        length: 200,
        nullable: true,
    })
    street!: string | null;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    building!: string | null;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    floor!: string | null;

    @Column({
        name: 'postal_code',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    postalCode!: string | null;

    @Column({
        name: 'is_primary',
        type: 'boolean',
        default: false,
    })
    isPrimary!: boolean;

    @ManyToOne(() => Client, (client) => client.addresses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client!: Client;
}
