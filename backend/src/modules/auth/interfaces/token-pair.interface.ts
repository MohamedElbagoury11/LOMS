/**
 * Access and Refresh Token pair emitted upon successful authentication or refresh.
 */
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
