/**
 * Role-permission assignment seed.
 *
 * Only the Administrator role receives ALL permissions at bootstrap time.
 * All other roles start with zero permissions; they are configured by
 * office administrators via the application UI after first login.
 */
/* eslint-disable no-console */
import { DataSource } from 'typeorm';

import { Permission } from '../../modules/permissions/entities/permission.entity';
import { RolePermission } from '../../modules/role-permissions/entities/role-permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { ADMINISTRATOR_ROLE_NAME } from './roles.seed';

export async function seedRolePermissions(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);

    // Load the Administrator role.
    const adminRole = await roleRepository.findOne({
        where: { name: ADMINISTRATOR_ROLE_NAME },
    });

    if (!adminRole) {
        throw new Error(
            `[role-permissions.seed] Administrator role not found. Run roles seed first.`,
        );
    }

    // Load all permissions.
    const allPermissions = await permissionRepository.find();

    if (allPermissions.length === 0) {
        throw new Error(
            `[role-permissions.seed] No permissions found. Run permissions seed first.`,
        );
    }

    // Load existing role-permission assignments to avoid duplicates.
    const existingAssignments = await rolePermissionRepository.find({
        where: { roleId: adminRole.id },
    });

    const existingPermissionIds = new Set(
        existingAssignments.map((rp) => rp.permissionId),
    );

    const toInsert: RolePermission[] = [];

    for (const permission of allPermissions) {
        if (!existingPermissionIds.has(permission.id)) {
            const rolePermission = rolePermissionRepository.create({
                roleId: adminRole.id,
                permissionId: permission.id,
            });
            toInsert.push(rolePermission);
        }
    }

    if (toInsert.length > 0) {
        await rolePermissionRepository.save(toInsert);
        console.log(
            `[role-permissions.seed] Assigned ${String(toInsert.length)} permission(s) to Administrator.`,
        );
    } else {
        console.log(
            `[role-permissions.seed] Administrator already has all permissions. Nothing to insert.`,
        );
    }
}
