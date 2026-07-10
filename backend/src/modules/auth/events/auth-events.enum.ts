/**
 * Event names for the authentication lifecycle events.
 * Triggered by this module to be consumed by the Audit module.
 */
export enum AuthEvent {
    LOGIN = 'auth.login',
    LOGOUT = 'auth.logout',
    LOGOUT_ALL = 'auth.logout_all',
    FAILED_LOGIN = 'auth.failed_login',
    REFRESH = 'auth.refresh',
    PASSWORD_CHANGE = 'auth.password_change',
    PASSWORD_RESET = 'auth.password_reset',
    SESSION_REVOKED = 'auth.session_revoked',
    SESSION_EXPIRED = 'auth.session_expired',
    ACCOUNT_LOCKED = 'auth.account_locked',
}
