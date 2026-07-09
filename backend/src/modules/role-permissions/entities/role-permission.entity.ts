import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';

/**
 * Junction record linking a role to a permission for RBAC authorization.
 *
 * Extends BaseEntity because this is a structural association table that does not
 * require user audit columns; assignment lifecycle is tracked via timestamps and soft delete.
 *
 * role_id and permission_id are explicit foreign key columns so business code can read and
 * write assignments without loading relation objects. Relations provide optional navigation only.
 *
 * Contains only role_id and permission_id so the table stays a pure many-to-many bridge.
 * A composite unique constraint on (role_id, permission_id) prevents duplicate permission grants.
 *
 * onDelete RESTRICT ensures roles and permissions cannot be hard-deleted while assignments
 * still exist, consistent with the project rule against cascade deletes.
 */
@Entity(DatabaseTable.ROLE_PERMISSIONS)
@Unique('uq_role_permissions_role_id_permission_id', ['roleId', 'permissionId'])
export class RolePermission extends BaseEntity {
  @Index()
  @Column({
    name: 'role_id',
    type: 'char',
    length: 36,
  })
  roleId!: string;

  @ManyToOne(() => Role, {
    eager: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;

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
}
