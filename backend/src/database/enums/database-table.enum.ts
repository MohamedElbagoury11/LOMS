/**
 * Canonical database table names for TypeORM entities.
 *
 * Centralizes table identifiers to avoid hardcoded strings across the codebase.
 */
export enum DatabaseTable {
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  USER_ROLES = 'user_roles',
  ROLE_PERMISSIONS = 'role_permissions',
  USER_PERMISSION_OVERRIDES = 'user_permission_overrides',
  CLIENTS = 'clients',
  CASES = 'cases',
  SESSIONS = 'sessions',
  AUDIT_LOGS = 'audit_logs',
}
