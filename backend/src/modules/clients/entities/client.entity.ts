import { Column, Entity, Index, OneToMany } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { ClientStatus } from '../enums/client-status.enum';
import { ClientType } from '../enums/client-type.enum';
import { ClientAddress } from './client-address.entity';
import { ClientAttachment } from './client-attachment.entity';
import { ClientContact } from './client-contact.entity';
import { ClientNote } from './client-note.entity';

@Entity('clients')
@Index('UQ_clients_client_code', ['clientCode'], { unique: true })
@Index('UQ_clients_phone', ['phone'], { unique: true })
@Index('UQ_clients_email', ['email'], { unique: true })
@Index('UQ_clients_national_id', ['nationalId'], { unique: true })
@Index('UQ_clients_tax_number', ['taxNumber'], { unique: true })
@Index('UQ_clients_commercial_registration', ['commercialRegistration'], { unique: true })
@Index('UQ_clients_passport_number', ['passportNumber'], { unique: true })
@Index('idx_clients_status', ['status'])
@Index('idx_clients_type', ['type'])
@Index('idx_clients_organization_name', ['organizationName'])
@Index('idx_clients_created_at', ['createdAt'])
export class Client extends AuditableEntity {
    @Column({
        name: 'client_code',
        type: 'varchar',
        length: 20,
    })
    clientCode!: string;

    @Column({
        type: 'enum',
        enum: ClientType,
    })
    type!: ClientType;

    @Column({
        type: 'enum',
        enum: ClientStatus,
        default: ClientStatus.Active,
    })
    status!: ClientStatus;

    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    firstName!: string | null;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    lastName!: string | null;

    @Column({
        name: 'organization_name',
        type: 'varchar',
        length: 200,
        nullable: true,
    })
    organizationName!: string | null;

    @Column({
        name: 'passport_number',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    passportNumber!: string | null;

    @Column({
        type: 'varchar',
        length: 20,
    })
    phone!: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    email!: string | null;

    @Column({
        name: 'national_id',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    nationalId!: string | null;

    @Column({
        name: 'tax_number',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    taxNumber!: string | null;

    @Column({
        name: 'commercial_registration',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    commercialRegistration!: string | null;

    @Column({
        name: 'date_of_birth',
        type: 'date',
        nullable: true,
    })
    dateOfBirth!: Date | null;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    gender!: string | null;

    @Column({
        name: 'preferred_language',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    preferredLanguage!: string | null;

    @Column({
        type: 'text',
        nullable: true,
    })
    notes!: string | null;

    @OneToMany(() => ClientContact, (contact) => contact.client)
    contacts!: ClientContact[];

    @OneToMany(() => ClientAddress, (address) => address.client)
    addresses!: ClientAddress[];

    @OneToMany(() => ClientNote, (note) => note.client)
    notesCollection!: ClientNote[];

    @OneToMany(() => ClientAttachment, (attachment) => attachment.client)
    attachments!: ClientAttachment[];
}
