/**
 * Token payload structure for JSON Web Tokens (JWT).
 *
 * Adheres strictly to docs/06-AUTHENTICATION_DESIGN.md section 6.
 * Minimizes payload footprint to only what is required to uniquely identify
 * the session. Roles/permissions must not be stored in the JWT payload.
 */
export interface JwtPayload {
    /** The subject (UUID of the user). */
    sub: string;

    /** The unique identifier of the user's database session. */
    sessionId: string;

    /** The username of the user. */
    username: string;
}
