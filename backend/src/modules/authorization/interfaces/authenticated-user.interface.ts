/**
 * Runtime authentication identity attached to an HTTP request after JWT validation.
 *
 * Contains only authentication context — never database entities or ORM models.
 * Permissions are populated lazily by PermissionsGuard via PermissionResolverService.
 */
export interface AuthenticatedUser {
    id: string;
    username: string;
    sessionId: string;
    mustChangePassword: boolean;
    permissions?: ReadonlySet<string>;
}
