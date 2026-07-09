import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { PermissionOverrideType } from '../../../common/enums/permission-override-type.enum';
import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';

/**
 * RBAC override record granting or denying a specific permission to an individual user.
 *
 * Extends BaseEntity because this is a structural mapping table that does not
 * require user audit columns; override lifecycle is tracked via timestamps and soft delete.
 *
 * user_id and permission_id are explicit foreign key columns so business code can read and
 * write overrides without loading relation objects. Relations provide optional navigation only.
 *
 * override_type stores whether the override explicitly allows or denies the permission,
 * supporting exceptional cases outside normal role-based grants.
 *
 * Contains only user_id, permission_id, and override_type so the table stays a focused
 * RBAC mapping without extra metadata. A composite unique constraint on (user_id, permission_id)
 * ensures a user may have only one override per permission.
 *
 * onDelete RESTRICT ensures users and permissions cannot be hard-deleted while overrides
 * still exist, consistent with the project rule against cascade deletes.
 */
@Entity(DatabaseTable.USER_PERMISSION_OVERRIDES)
@Unique('uq_user_permission_overrides_user_id_permission_id', ['userId', 'permissionId'])
export class UserPermissionOverride extends BaseEntity {
  @Index()
  @Column({
    name: 'user_id',
    type: 'char',
    length: 36,
  })
  userId!: string;

  @ManyToOne(() => User, {
    eager: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @Index()
  @Column({
    name: 'permission_id',
    type: 'char',
    length: 36,
  })
  permissionId!: string;

  @ManyToOne(() => Permission, {
    eager: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'permission_id',
  })
  permission!: Permission;

  @Column({
    name: 'override_type',
    type: 'enum',
    enum: PermissionOverrideType,
  })
  overrideType!: PermissionOverrideType;
}
