import { Column, Entity, Index } from 'typeorm';

import { UserStatus } from '../../../common/enums/user-status.enum';
import { AuditableEntity } from '../../../database/entities/auditable.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';

/**
 * System user account used for authentication, authorization, and audit attribution.
 *
 * Relations to roles, permissions, and sessions are deferred to future modules.
 */
@Entity(DatabaseTable.USERS)
export class User extends AuditableEntity {
  @Index({ unique: true })
  @Column({
    name: 'username',
    type: 'varchar',
    length: 100,
    transformer: {
      to: (value: string): string => value.trim().toLowerCase(),
      from: (value: string): string => value,
    },
  })
  username!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash!: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName!: string;

  @Index({ unique: true })
  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
  })
  phone!: string;

  @Index({ unique: true })
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email!: string | null;

  @Index()
  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Active,
  })
  status!: UserStatus;

  @Column({
    name: 'must_change_password',
    type: 'boolean',
    default: true,
  })
  mustChangePassword!: boolean;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
