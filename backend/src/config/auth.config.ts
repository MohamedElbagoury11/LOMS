import { registerAs } from '@nestjs/config';

export interface AuthConfig {
    jwtAccessSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;
    jwtRefreshExpiresInMs: number;
    cookieName: string;
    /** True in production — enables the Secure flag on the rt HttpOnly cookie. */
    cookieSecure: boolean;
}

function parseDurationToMilliseconds(value: string): number {
    const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
    if (!match) {
        throw new Error(`Invalid duration value: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    switch (unit) {
        case 'ms':
            return amount;
        case 's':
            return amount * 1000;
        case 'm':
            return amount * 60 * 1000;
        case 'h':
            return amount * 60 * 60 * 1000;
        case 'd':
            return amount * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Invalid duration unit: ${unit}`);
    }
}

export const authConfig = registerAs(
    'auth',
    (): AuthConfig => {
        const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';

        return {
            jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
            jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
            jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
            jwtRefreshExpiresIn,
            jwtRefreshExpiresInMs: parseDurationToMilliseconds(jwtRefreshExpiresIn),
            cookieName: process.env.AUTH_COOKIE_NAME ?? 'rt',
            cookieSecure: process.env.NODE_ENV === 'production',
        };
    },
);
