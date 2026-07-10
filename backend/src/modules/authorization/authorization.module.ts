import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permission } from '../permissions/entities/permission.entity';
import { RolePermission } from '../role-permissions/entities/role-permission.entity';
import { Role } from '../roles/entities/role.entity';
import { UserPermissionOverride } from '../user-permission-overrides/entities/user-permission-override.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionResolverService } from './services/permission-resolver.service';

/**
 * Authorization module — permission resolution and access control infrastructure.
 *
 * Exports PermissionsGuard for route-level enforcement and PermissionResolverService
 * for consumers that need direct permission resolution within a request scope.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserRole,
            UserPermissionOverride,
            RolePermission,
            Role,
            Permission,
        ]),
    ],
    providers: [PermissionResolverService, PermissionsGuard],
    exports: [PermissionResolverService, PermissionsGuard],
})
export class AuthorizationModule {}
