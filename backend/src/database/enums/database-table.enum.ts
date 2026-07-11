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
  CASE_CLIENTS = 'case_clients',
  CASE_LAWYERS = 'case_lawyers',
  CASE_OPPOSITE_PARTIES = 'case_opposite_parties',
  CASE_NOTES = 'case_notes',
  CASE_ATTACHMENTS = 'case_attachments',
  HEARINGS = 'hearings',
  HEARING_NOTES = 'hearing_notes',
  HEARING_ATTACHMENTS = 'hearing_attachments',
  DOCUMENTS = 'documents',
  DOCUMENT_SHARES = 'document_shares',
  SESSIONS = 'sessions',
  AUDIT_LOGS = 'audit_logs',
}
