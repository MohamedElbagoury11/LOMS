import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Scope,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import {
    AUTHORIZATION_FORBIDDEN_MESSAGE,
    REQUIRED_PERMISSIONS_KEY,
} from '../constants/authorization.constants';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PermissionResolverService } from '../services/permission-resolver.service';

type AuthenticatedRequest = Request & {
    user?: AuthenticatedUser;
};

/**
 * Enforces permission metadata declared by @RequirePermissions().
 *
 * Evaluates effective permissions loaded from the database through
 * PermissionResolverService — never from the JWT or client input.
 *
 * Must run after JwtAuthGuard so that req.user is populated.
 */
@Injectable({ scope: Scope.REQUEST })
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionResolverService: PermissionResolverService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.getRequiredPermissions(context);

        if (requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = this.getAuthenticatedUser(request);

        await this.ensurePermissionsLoaded(user);
        request.user = user;

        if (!this.hasRequiredPermissions(user.permissions, requiredPermissions)) {
            throw new ForbiddenException(AUTHORIZATION_FORBIDDEN_MESSAGE);
        }

        return true;
    }

    /**
     * Reads required permission names from handler or controller metadata.
     */
    private getRequiredPermissions(context: ExecutionContext): string[] {
        const permissions = this.reflector.getAllAndOverride<string[] | undefined>(
            REQUIRED_PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        return Array.isArray(permissions) ? permissions : [];
    }

    /**
     * Returns the authenticated user attached to the request.
     */
    private getAuthenticatedUser(request: AuthenticatedRequest): AuthenticatedUser {
        const user = request.user;

        if (!user?.id) {
            throw new UnauthorizedException();
        }

        return user;
    }

    /**
     * Resolves and attaches effective permissions when not already present.
     */
    private async ensurePermissionsLoaded(user: AuthenticatedUser): Promise<void> {
        if (user.permissions) {
            return;
        }

        user.permissions = await this.permissionResolverService.resolvePermissions(user.id);
    }

    /**
     * Verifies the user holds every required permission (exact name match).
     */
    private hasRequiredPermissions(
        effectivePermissions: ReadonlySet<string> | undefined,
        requiredPermissions: readonly string[],
    ): boolean {
        if (!effectivePermissions) {
            return false;
        }

        return requiredPermissions.every((permission) =>
            effectivePermissions.has(permission),
        );
    }
}
