/**
 * Authorization-scoped constants.
 *
 * Centralizes metadata keys and client-facing messages so guards and decorators
 * reference a single source of truth.
 *
 * See docs/05-RBAC_DESIGN.md for the authoritative design requirements.
 */

/** Reflector metadata key for required permission names attached by @RequirePermissions(). */
export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';

/** Reflector metadata key for role names attached by @Roles() (future use only). */
export const ROLES_KEY = 'roles';

/**
 * Generic client-facing message when authorization fails.
 * Internal permission and role names must never be exposed.
 */
export const AUTHORIZATION_FORBIDDEN_MESSAGE =
    'You do not have permission to perform this action.';
