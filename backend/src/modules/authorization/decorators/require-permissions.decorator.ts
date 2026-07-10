import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { REQUIRED_PERMISSIONS_KEY } from '../constants/authorization.constants';

/**
 * Declares one or more permissions required to access a route handler or controller.
 *
 * The PermissionsGuard reads this metadata via Reflector and evaluates effective
 * permissions loaded from the database — never from the JWT.
 *
 * @example
 * @RequirePermissions('clients.view')
 * @Get()
 * findAll() { ... }
 *
 * @example
 * @RequirePermissions('cases.view', 'cases.update')
 * @Patch(':id')
 * update() { ... }
 */
export const RequirePermissions = (
    ...permissions: string[]
): CustomDecorator => SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
