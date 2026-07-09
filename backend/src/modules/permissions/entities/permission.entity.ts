import { Column, Entity, Index } from 'typeorm';

import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';

/**
 * RBAC permission definition used as a stable, machine-readable authorization identifier.
 *
 * Extends BaseEntity because permissions are lookup/configuration records that do not
 * require user audit columns (created_by, updated_by, deleted_by).
 *
 * Relations to roles and user overrides are deferred to future modules.
 * The name field is the canonical identifier referenced by guards, seeds, and junction tables.
 */
@Entity(DatabaseTable.PERMISSIONS)
export class Permission extends BaseEntity {
  @Index({ unique: true })
  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    transformer: {
      to: (value: string): string => value.trim().toLowerCase(),
      from: (value: string): string => value,
    },
  })
  name!: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 100,
  })
  displayName!: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description!: string | null;

  @Index()
  @Column({
    name: 'status',
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.Active,
  })
  status!: EntityStatus;
}
