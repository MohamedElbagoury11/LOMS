import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '../constants/authorization.constants';

/**
 * Attaches role names as route metadata for future use.
 *
 * Authorization decisions MUST use @RequirePermissions() — not role names.
 * This decorator exists only as a forward-compatible metadata hook and is not
 * evaluated by the PermissionsGuard in Version 1.
 */
export const Roles = (...roles: string[]): CustomDecorator =>
    SetMetadata(ROLES_KEY, roles);
