/**
 * Canonical permission definitions for the LOMS RBAC system.
 *
 * Every permission follows the `module.action` naming convention defined in
 * docs/05-RBAC_DESIGN.md.  This file is the single source of truth for
 * permission names used by guards, seeds, and tests.
 *
 * Do NOT add, remove, or rename entries unless you also update the migration
 * and re-run the seed.
 */
export interface PermissionDefinition {
    name: string;
    displayName: string;
    description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
    // ─── Clients ───────────────────────────────────────────────────────────────
    { name: 'clients.view', displayName: 'View Clients', description: 'View client records.' },
    { name: 'clients.create', displayName: 'Create Clients', description: 'Create new client records.' },
    { name: 'clients.update', displayName: 'Update Clients', description: 'Update existing client records.' },
    { name: 'clients.archive', displayName: 'Archive Clients', description: 'Archive client records.' },

    // ─── Cases ─────────────────────────────────────────────────────────────────
    { name: 'cases.view', displayName: 'View Cases', description: 'View case records.' },
    { name: 'cases.create', displayName: 'Create Cases', description: 'Create new case records.' },
    { name: 'cases.update', displayName: 'Update Cases', description: 'Update existing case records.' },
    { name: 'cases.archive', displayName: 'Archive Cases', description: 'Archive case records.' },

    // ─── Sessions ──────────────────────────────────────────────────────────────
    { name: 'sessions.view', displayName: 'View Sessions', description: 'View session records.' },
    { name: 'sessions.create', displayName: 'Create Sessions', description: 'Create new session records.' },
    { name: 'sessions.update', displayName: 'Update Sessions', description: 'Update existing session records.' },
    { name: 'sessions.archive', displayName: 'Archive Sessions', description: 'Archive session records.' },

    // ─── Documents ─────────────────────────────────────────────────────────────
    { name: 'documents.view', displayName: 'View Documents', description: 'View uploaded documents.' },
    { name: 'documents.upload', displayName: 'Upload Documents', description: 'Upload new documents.' },
    { name: 'documents.download', displayName: 'Download Documents', description: 'Download documents.' },
    { name: 'documents.preview', displayName: 'Preview Documents', description: 'Preview supported documents inline.' },
    { name: 'documents.share.create', displayName: 'Create Document Shares', description: 'Create temporary secure document share links.' },
    { name: 'documents.share.read', displayName: 'Read Document Shares', description: 'View document share links.' },
    { name: 'documents.share.revoke', displayName: 'Revoke Document Shares', description: 'Revoke temporary document share links.' },
    { name: 'documents.archive', displayName: 'Archive Documents', description: 'Archive documents.' },

    // ─── Finance ───────────────────────────────────────────────────────────────
    { name: 'finance.view', displayName: 'View Finance', description: 'View financial transactions.' },
    { name: 'finance.create', displayName: 'Create Finance', description: 'Create financial transactions.' },
    { name: 'finance.update', displayName: 'Update Finance', description: 'Update financial transactions.' },
    { name: 'finance.delete', displayName: 'Delete Finance', description: 'Delete financial transactions.' },

    // ─── Reports ───────────────────────────────────────────────────────────────
    { name: 'reports.view', displayName: 'View Reports', description: 'View generated reports.' },
    { name: 'reports.export', displayName: 'Export Reports', description: 'Export data to reports.' },

    // ─── Notifications ─────────────────────────────────────────────────────────
    { name: 'notifications.view', displayName: 'View Notifications', description: 'View notifications.' },
    { name: 'notifications.manage', displayName: 'Manage Notifications', description: 'Manage notification settings.' },

    // ─── Users ─────────────────────────────────────────────────────────────────
    { name: 'users.view', displayName: 'View Users', description: 'View user accounts.' },
    { name: 'users.create', displayName: 'Create Users', description: 'Create new user accounts.' },
    { name: 'users.update', displayName: 'Update Users', description: 'Update existing user accounts.' },
    { name: 'users.archive', displayName: 'Archive Users', description: 'Archive user accounts.' },

    // ─── Roles ─────────────────────────────────────────────────────────────────
    { name: 'roles.view', displayName: 'View Roles', description: 'View roles.' },
    { name: 'roles.create', displayName: 'Create Roles', description: 'Create new roles.' },
    { name: 'roles.update', displayName: 'Update Roles', description: 'Update existing roles.' },

    // ─── Permissions ───────────────────────────────────────────────────────────
    { name: 'permissions.manage', displayName: 'Manage Permissions', description: 'Manage role and user permissions.' },

    // ─── Settings ──────────────────────────────────────────────────────────────
    { name: 'settings.manage', displayName: 'Manage Settings', description: 'Manage system settings.' },

    // ─── Audit ─────────────────────────────────────────────────────────────────
    { name: 'audit.view', displayName: 'View Audit Logs', description: 'View system audit logs.' },

    // ─── Master Data ───────────────────────────────────────────────────────────
    { name: 'master-data.manage', displayName: 'Manage Master Data', description: 'Manage lookup/master data tables.' },
];
