import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Client } from '../../clients/entities/client.entity';
import { Case } from './case.entity';

@Entity(DatabaseTable.CASE_CLIENTS)
@Index('UQ_case_clients_case_client', ['caseId', 'clientId'], { unique: true })
@Index('idx_case_clients_case_id', ['caseId'])
@Index('idx_case_clients_client_id', ['clientId'])
export class CaseClient extends AuditableEntity {
    @Column({ name: 'case_id', type: 'varchar', length: 36 })
    caseId!: string;

    @Column({ name: 'client_id', type: 'varchar', length: 36 })
    clientId!: string;

    @Column({ name: 'is_primary', type: 'boolean', default: false })
    isPrimary!: boolean;

    @ManyToOne(() => Case, (c) => c.caseClients, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'case_id' })
    case!: Case;

    @ManyToOne(() => Client, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'client_id' })
    client!: Client;
}
