/**
 * Canonical audit entity categories.
 *
 * Identifies the domain object type associated with an audit record.
 */
export enum AuditEntity {
    SYSTEM = 'SYSTEM',
    AUTH = 'AUTH',
    USER = 'USER',
    ROLE = 'ROLE',
    PERMISSION = 'PERMISSION',
    CLIENT = 'CLIENT',
    CASE = 'CASE',
    HEARING = 'HEARING',
    DOCUMENT = 'DOCUMENT',
    REPORT = 'REPORT',
    SETTINGS = 'SETTINGS',
    SESSION = 'SESSION',
}
