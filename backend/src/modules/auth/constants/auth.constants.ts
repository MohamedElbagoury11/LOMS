/**
 * Authentication-scoped constants.
 *
 * Centralizes magic numbers and injection tokens so they can be referenced
 * consistently across guards, strategies, and services.
 *
 * See docs/06-AUTHENTICATION_DESIGN.md for the authoritative design requirements.
 */

/** Maximum number of failed login attempts before the account is locked. */
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;

/** Duration in milliseconds for which an account remains locked after the threshold is reached. */
export const ACCOUNT_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** Default access token lifetime.  Should be overridden by JWT_ACCESS_EXPIRES_IN env var. */
export const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = '15m';

/** Default refresh token lifetime.  Should be overridden by JWT_REFRESH_EXPIRES_IN env var. */
export const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = '30d';

/** Refresh token cookie name. Should be overridden by AUTH_COOKIE_NAME env var. */
export const DEFAULT_REFRESH_COOKIE_NAME = 'rt';

/** NestJS DI injection token for the JWT access-token secret. */
export const JWT_ACCESS_SECRET = 'JWT_ACCESS_SECRET';

/** NestJS DI injection token for the JWT refresh-token secret. */
export const JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET';
