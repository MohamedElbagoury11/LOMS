/**
 * Role definitions for the LOMS RBAC system.
 *
 * All roles are defined in docs/05-RBAC_DESIGN.md.
 * The Administrator role carries `isSystem = true` to prevent accidental deletion.
 * All other roles have `isSystem = false`.
 */
export interface RoleDefinition {
    name: string;
    displayName: string;
    description: string;
    isSystem: boolean;
}

/** Canonical machine-readable role name for Administrator.  Used to look up
 *  the role when assigning all permissions and when creating the admin user. */
export const ADMINISTRATOR_ROLE_NAME = 'ADMINISTRATOR';

export const ROLE_DEFINITIONS: RoleDefinition[] = [
    {
        name: ADMINISTRATOR_ROLE_NAME,
        displayName: 'Administrator',
        description: 'Full system access. Manages all users, roles, and system settings.',
        isSystem: true,
    },
    {
        name: 'OFFICE_MANAGER',
        displayName: 'Office Manager',
        description: 'Operational management of day-to-day office activities.',
        isSystem: false,
    },
    {
        name: 'SENIOR_LAWYER',
        displayName: 'Senior Lawyer',
        description: 'Manages legal work and supervises cases.',
        isSystem: false,
    },
    {
        name: 'LAWYER',
        displayName: 'Lawyer',
        description: 'Manages assigned legal cases.',
        isSystem: false,
    },
    {
        name: 'SECRETARY',
        displayName: 'Secretary',
        description: 'Manages scheduling, sessions, and documents.',
        isSystem: false,
    },
    {
        name: 'ACCOUNTANT',
        displayName: 'Accountant',
        description: 'Access to financial records only.',
        isSystem: false,
    },
    {
        name: 'RECEPTION',
        displayName: 'Reception',
        description: 'Registers clients and captures basic information.',
        isSystem: false,
    },
    {
        name: 'READ_ONLY',
        displayName: 'Read Only',
        description: 'View-only access to system data.',
        isSystem: false,
    },
];
