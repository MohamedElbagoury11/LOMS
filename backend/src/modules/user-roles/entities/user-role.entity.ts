import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from '../../../database/entities/base.entity';
import { DatabaseTable } from '../../../database/enums/database-table.enum';
import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Junction record linking a user to a role for RBAC membership.
 *
 * Extends BaseEntity because this is a structural association table that does not
 * require user audit columns; assignment lifecycle is tracked via timestamps and soft delete.
 *
 * Contains only user_id and role_id so the table stays a pure many-to-many bridge.
 * A composite unique constraint on (user_id, role_id) prevents duplicate role assignments.
 *
 * onDelete RESTRICT ensures users and roles cannot be hard-deleted while assignments
 * still exist, consistent with the project rule against cascade deletes.
 */
@Entity(DatabaseTable.USER_ROLES)
@Unique('uq_user_roles_user_id_role_id', ['userId', 'roleId'])
export class UserRole extends BaseEntity {
  @Index()
  @Column({
    name: 'user_id',
    type: 'char',
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

  @Index()
  @Column({
    name: 'role_id',
    type: 'char',
    length: 36,
  })
  roleId!: string;

  @ManyToOne(() => Role, {
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;
}
