/**
 * Canonical lifecycle status states for a user authentication session.
 */
export enum SessionStatus {
    Active = 'active',
    Revoked = 'revoked',
    Expired = 'expired',
}
