import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { User } from '../../users/entities/user.entity';
import { SessionStatus } from '../enums/session-status.enum';

/**
 * Persisted user session metadata for managing session state, revocation, and device auditing.
 *
 * Implements token strategy requirements from docs/06-AUTHENTICATION_DESIGN.md.
 */
@Entity(DatabaseTable.SESSIONS)
export class Session extends BaseEntity {
    @Index()
    @Column({
        name: 'user_id',
        type: 'varchar',
        length: 36,
    })
    userId!: string;

    @ManyToOne(() => User, {
        onDelete: 'RESTRICT',
        eager: false,
    })
    @JoinColumn({
        name: 'user_id',
    })
    user!: User;

    @Column({
        name: 'refresh_token_hash',
        type: 'varchar',
        length: 255,
    })
    refreshTokenHash!: string;

    @Column({
        name: 'ip_address',
        type: 'varchar',
        length: 45,
    })
    ipAddress!: string;

    @Column({
        name: 'user_agent',
        type: 'varchar',
        length: 500,
    })
    userAgent!: string;

    @Column({
        name: 'device',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    device!: string | null;

    @Column({
        name: 'operating_system',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    operatingSystem!: string | null;

    @Column({
        name: 'last_activity_at',
        type: 'timestamp',
    })
    lastActivityAt!: Date;

    @Column({
        name: 'expires_at',
        type: 'timestamp',
    })
    expiresAt!: Date;

    @Column({
        name: 'revoked_at',
        type: 'timestamp',
        nullable: true,
    })
    revokedAt!: Date | null;

    @Index()
    @Column({
        name: 'status',
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.Active,
    })
    status!: SessionStatus;
}
