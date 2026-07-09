import { Column, Entity, Index } from 'typeorm';

import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';

/**
 * Application role used by the RBAC system to bundle permissions.
 *
 * Relations to users and permissions are deferred to future modules.
 */
@Entity(DatabaseTable.ROLES)
export class Role extends BaseEntity {
  @Index({ unique: true })
  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    transformer: {
      to: (value: string): string => value.trim().toUpperCase(),
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

  @Column({
    name: 'is_system',
    type: 'boolean',
    default: false,
  })
  isSystem!: boolean;
}
