import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { PermissionOverrideType } from '../../../common/enums/permission-override-type.enum';
import { Permission } from '../../permissions/entities/permission.entity';
import { RolePermission } from '../../role-permissions/entities/role-permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserPermissionOverride } from '../../user-permission-overrides/entities/user-permission-override.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';

interface PermissionOverrideRow {
    overrideType: PermissionOverrideType;
    permissionName: string;
}

/**
 * Resolves the effective permission set for a user.
 *
 * Implements the permission resolution rules defined in docs/05-RBAC_DESIGN.md.
 * This service is the single source of truth for authorization data and will be
 * consumed by guards and middleware in later phases.
 *
 * Request-scoped so repeated calls within the same HTTP request reuse cached
 * results without hitting the database again.
 */
@Injectable({ scope: Scope.REQUEST })
export class PermissionResolverService {
    private readonly requestCache = new Map<string, ReadonlySet<string>>();

    constructor(
        @InjectRepository(UserPermissionOverride)
        private readonly userPermissionOverrideRepository: Repository<UserPermissionOverride>,

        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
    ) {}

    /**
     * Returns every effective permission name granted to the user.
     *
     * Returns an empty set when the user does not exist or has no grants.
     * Never throws — the authorization layer decides how to handle missing
     * users or denied access.
     */
    async resolvePermissions(userId: string): Promise<Set<string>> {
        const cached = this.requestCache.get(userId);
        if (cached) {
            return new Set(cached);
        }

        const effectivePermissions = await this.computeEffectivePermissions(userId);
        this.requestCache.set(userId, effectivePermissions);

        return new Set(effectivePermissions);
    }

    /**
     * Loads override and role data, then applies the resolution algorithm.
     *
     * Unknown users naturally resolve to an empty set because they have no
     * role assignments or permission overrides.
     */
    private async computeEffectivePermissions(userId: string): Promise<ReadonlySet<string>> {
        const [overrideRows, rolePermissions] = await Promise.all([
            this.loadPermissionOverrides(userId),
            this.loadRolePermissionNames(userId),
        ]);

        const denyOverrides = new Set<string>();
        const allowOverrides = new Set<string>();

        for (const row of overrideRows) {
            if (row.overrideType === PermissionOverrideType.DENY) {
                denyOverrides.add(row.permissionName);
                continue;
            }

            allowOverrides.add(row.permissionName);
        }

        return this.buildEffectivePermissionSet(
            rolePermissions,
            allowOverrides,
            denyOverrides,
        );
    }

    /**
     * Step 1 — Load user permission overrides (DENY and ALLOW partitions).
     *
     * Archived permissions are excluded; they never contribute to authorization.
     */
    private async loadPermissionOverrides(userId: string): Promise<PermissionOverrideRow[]> {
        return this.userPermissionOverrideRepository
            .createQueryBuilder('override')
            .innerJoin(Permission, 'permission', 'permission.id = override.permissionId')
            .select('override.overrideType', 'overrideType')
            .addSelect('permission.name', 'permissionName')
            .where('override.userId = :userId', { userId })
            .andWhere('permission.status = :permissionStatus', {
                permissionStatus: EntityStatus.Active,
            })
            .getRawMany<PermissionOverrideRow>();
    }

    /**
     * Step 3 — Load the union of permissions inherited from all assigned roles.
     *
     * Only active roles and active permissions are included.
     * Roles never deny permissions; only overrides may remove access later.
     */
    private async loadRolePermissionNames(userId: string): Promise<ReadonlySet<string>> {
        const rows = await this.userRoleRepository
            .createQueryBuilder('userRole')
            .innerJoin(Role, 'role', 'role.id = userRole.roleId')
            .innerJoin(RolePermission, 'rolePermission', 'rolePermission.roleId = role.id')
            .innerJoin(Permission, 'permission', 'permission.id = rolePermission.permissionId')
            .select('DISTINCT permission.name', 'permissionName')
            .where('userRole.userId = :userId', { userId })
            .andWhere('role.status = :roleStatus', { roleStatus: EntityStatus.Active })
            .andWhere('permission.status = :permissionStatus', {
                permissionStatus: EntityStatus.Active,
            })
            .getRawMany<{ permissionName: string }>();

        return new Set(rows.map((row) => row.permissionName));
    }

    /**
     * Step 4 — Build the final effective permission set.
     */
    private buildEffectivePermissionSet(
        rolePermissions: ReadonlySet<string>,
        allowOverrides: ReadonlySet<string>,
        denyOverrides: ReadonlySet<string>,
    ): ReadonlySet<string> {
        const effectivePermissions = new Set<string>(rolePermissions);

        // Apply ALLOW overrides.
        for (const permissionName of allowOverrides) {
            effectivePermissions.add(permissionName);
        }

        // Apply DENY overrides.
        for (const permissionName of denyOverrides) {
            effectivePermissions.delete(permissionName);
        }

        return effectivePermissions;
    }
}
