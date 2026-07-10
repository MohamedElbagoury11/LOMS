import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { AuthConfig } from '../../config/auth.config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenPair } from './interfaces/token-pair.interface';

/**
 * Service for generating, signing, and verifying Access and Refresh JWTs.
 *
 * Implements token strategy and payload design from docs/06-AUTHENTICATION_DESIGN.md.
 */
@Injectable()
export class TokenService {
    private readonly authConfig: AuthConfig;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        const config = this.configService.get<AuthConfig>('auth');
        if (!config) {
            throw new Error('Authentication configuration is missing. Ensure environment variables are loaded.');
        }
        this.authConfig = config;
    }

    /**
     * Generates a short-lived cryptographically signed Access Token.
     *
     * @param payload User identification payload.
     * @returns Signed JWT string.
     */
    async generateAccessToken(payload: JwtPayload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.authConfig.jwtAccessSecret,
            expiresIn: this.authConfig.jwtAccessExpiresIn as StringValue,
        });
    }

    /**
     * Generates a long-lived cryptographically signed Refresh Token.
     *
     * @param payload User identification payload.
     * @returns Signed JWT string.
     */
    async generateRefreshToken(payload: JwtPayload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.authConfig.jwtRefreshSecret,
            expiresIn: this.authConfig.jwtRefreshExpiresIn as StringValue,
        });
    }

    /**
     * Generates both Access and Refresh tokens for a new session.
     *
     * @param payload User identification payload.
     * @returns An object containing both tokens.
     */
    async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Verifies an Access Token against the configured access secret.
     *
     * @param token Access Token.
     * @returns Decoded payload package if signature is correct and token is active.
     */
    async verifyAccessToken(token: string): Promise<JwtPayload> {
        try {
            return await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: this.authConfig.jwtAccessSecret,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    /**
     * Verifies a Refresh Token against the configured refresh secret.
     *
     * @param token Refresh Token.
     * @returns Decoded payload package if signature is correct and token is active.
     */
    async verifyRefreshToken(token: string): Promise<JwtPayload> {
        try {
            return await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: this.authConfig.jwtRefreshSecret,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}
