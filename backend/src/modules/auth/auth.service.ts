import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { CookieOptions, Request, Response } from 'express';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { UserStatus } from '../../common/enums/user-status.enum';
import { AuthConfig } from '../../config/auth.config';
import { User } from '../users/entities/user.entity';
import {
    ACCOUNT_LOCK_DURATION_MS,
    MAX_FAILED_LOGIN_ATTEMPTS,
} from './constants/auth.constants';
import { AdminResetPasswordResponseDto } from './dto/admin-reset-password-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { Session } from './entities/session.entity';
import { SessionStatus } from './enums/session-status.enum';
import { AuthEventDispatcher } from './events/auth-event-dispatcher';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

const INVALID_LOGIN_MESSAGE = 'Invalid credentials';
const INVALID_REFRESH_TOKEN_MESSAGE = 'Refresh token is invalid';

/** Pre-computed Argon2id hash used for constant-time login when the username does not exist. */
const DUMMY_PASSWORD_HASH =
    '$argon2id$v=19$m=65536,t=3,p=4$Yi4w4d1MOtMKBzVmH/ytWg$vbmTJFVODxCey0sI0vz/YBt79jHLL+k/vsl3LTw8KuI';

interface RefreshRotationResult {
    accessToken: string;
    refreshToken: string;
}

/**
 * Core authentication service.
 *
 * Implements the Login and Refresh flows defined in
 * docs/06-AUTHENTICATION_DESIGN.md.
 *
 * Login flow  (§4):
 *  1. Validate username (format + existence)
 *  2. Load user from database
 *  3. Check account status  (active / inactive / locked)
 *  4. Verify password hash  (Argon2id)
 *  5. Track failed attempts / reset on success
 *  6. Lock account when threshold is reached
 *  7. Create session record
 *  8. Generate Access + Refresh token pair
 *  9. Store hashed Refresh Token in session
 * 10. Set HttpOnly cookie; return Access Token
 *
 * Refresh flow  (§16):
 *  1. Extract Refresh Token from HttpOnly cookie
 *  2. Verify JWT signature and expiry
 *  3. Load session from database
 *  4. Validate session status (active, not revoked, not expired)
 *  5. Verify Refresh Token hash against stored hash
 *  6. Rotate: generate new token pair
 *  7. Persist new hash in session; update lastActivityAt
 *  8. Set new HttpOnly cookie; return new Access Token
 *
 * Logout flow  (§14):
 *  1. Extract and verify Refresh Token from HttpOnly cookie
 *  2. Load active session via sessionId from payload
 *  3. Mark session as Revoked; set revokedAt timestamp
 *  4. Clear the rt cookie
 *
 * Logout-All flow  (§15):
 *  1. Extract and verify Refresh Token from HttpOnly cookie
 *  2. Bulk-update all active sessions for the user to Revoked
 *  3. Clear the rt cookie
 */
@Injectable()
export class AuthService {
    private readonly authConfig: AuthConfig;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,

        private readonly dataSource: DataSource,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,
        private readonly authEventDispatcher: AuthEventDispatcher,
    ) {
        const config = this.configService.get<AuthConfig>('auth');
        if (!config) {
            throw new Error('Auth configuration is missing');
        }
        this.authConfig = config;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Authenticates a user and issues a new session with JWT tokens.
     *
     * @param dto      Login credentials.
     * @param request  Raw HTTP request (IP + User-Agent capture).
     * @param response Raw HTTP response (cookie setter).
     * @returns        Access Token, session ID, and mustChangePassword flag.
     */
    async login(
        dto: LoginDto,
        request: Request,
        response: Response,
    ): Promise<LoginResponseDto> {
        // Steps 1 & 2 — Validate username format and load user
        const user = await this.loadUserByUsername(dto.username);

        if (!user) {
            await this.passwordService.verifyPassword(dto.password, DUMMY_PASSWORD_HASH);

            this.authEventDispatcher.dispatchFailedLogin({
                username: dto.username,
                reason: 'Invalid username',
                ipAddress: request.ip ?? 'unknown',
                userAgent: request.headers['user-agent'] ?? 'unknown',
                timestamp: new Date(),
            });

            throw new UnauthorizedException(INVALID_LOGIN_MESSAGE);
        }

        // Step 3 — Verify password (constant-time Argon2id comparison)
        const isPasswordValid = await this.passwordService.verifyPassword(
            dto.password,
            user.passwordHash,
        );

        // Step 4 — Check account status (same client response regardless of reason)
        const loginBlockReason = this.getLoginBlockReason(user);
        if (loginBlockReason) {
            this.authEventDispatcher.dispatchFailedLogin({
                username: dto.username,
                reason: loginBlockReason,
                ipAddress: request.ip ?? 'unknown',
                userAgent: request.headers['user-agent'] ?? 'unknown',
                timestamp: new Date(),
            });

            throw new UnauthorizedException(INVALID_LOGIN_MESSAGE);
        }

        if (!isPasswordValid) {
            // Steps 5 & 6 — Track failure; lock if threshold reached
            await this.handleFailedAttempt(user);

            this.authEventDispatcher.dispatchFailedLogin({
                username: dto.username,
                reason: 'Invalid password',
                ipAddress: request.ip ?? 'unknown',
                userAgent: request.headers['user-agent'] ?? 'unknown',
                timestamp: new Date(),
            });

            throw new UnauthorizedException(INVALID_LOGIN_MESSAGE);
        }

        // Step 5 (success path) — Reset failed attempts counter
        await this.resetFailedAttempts(user);

        // Step 7 — Create session
        const session = await this.createSession(user, request);

        // Step 8 — Generate token pair
        const payload: JwtPayload = {
            sub: user.id,
            sessionId: session.id,
            username: user.username,
        };

        const { accessToken, refreshToken } =
            await this.tokenService.generateTokenPair(payload);

        // Step 9 — Store hashed Refresh Token in session
        session.refreshTokenHash = await this.passwordService.hashPassword(refreshToken);
        await this.sessionRepository.save(session);

        // Step 10 — Update last login timestamp and set cookie
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);

        this.setRefreshCookie(response, refreshToken);

        this.authEventDispatcher.dispatchLogin({
            userId: user.id,
            username: user.username,
            sessionId: session.id,
            ipAddress: request.ip ?? 'unknown',
            userAgent: request.headers['user-agent'] ?? 'unknown',
            timestamp: new Date(),
        });

        return {
            accessToken,
            sessionId: session.id,
            mustChangePassword: user.mustChangePassword,
        };
    }

    /**
     * Validates the Refresh Token, rotates it, and issues a new Access Token.
     *
     * @param refreshToken  Raw Refresh Token extracted from the HttpOnly cookie.
     * @param response      Raw HTTP response (new cookie setter).
     * @returns             New Access Token.
     */
    async refresh(
        refreshToken: string,
        response: Response,
    ): Promise<RefreshResponseDto> {
        // Step 2 — Verify JWT signature and expiry against the refresh secret
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);

        // Steps 3–7 — Validate session, verify hash, rotate tokens atomically
        const result = await this.dataSource.transaction((manager) =>
            this.rotateRefreshTokenWithLock(manager, refreshToken, payload),
        );

        // Step 8 — Set rotated cookie and return new Access Token
        this.setRefreshCookie(response, result.refreshToken);

        this.authEventDispatcher.dispatchRefresh({
            userId: payload.sub,
            sessionId: payload.sessionId,
            timestamp: new Date(),
        });

        return { accessToken: result.accessToken };
    }

    /**
     * Revokes the current session identified by the Refresh Token cookie.
     *
     * Flow (§14):
     *  1. Verify Refresh Token JWT (signature + expiry)
     *  2. Load the active session identified by the payload's sessionId
     *  3. Mark session Revoked + stamp revokedAt
     *  4. Clear the rt HttpOnly cookie
     *
     * @param refreshToken  Raw Refresh Token from the rt cookie.
     * @param response      HTTP response for cookie removal.
     */
    async logout(refreshToken: string, response: Response): Promise<void> {
        // Step 1 — Verify signature; reject forged or expired tokens
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);

        // Step 2 — Load the specific session (must be active)
        const session = await this.loadActiveSession(payload.sessionId);

        // Step 3 — Revoke session
        session.status = SessionStatus.Revoked;
        session.revokedAt = new Date();
        await this.sessionRepository.save(session);

        // Step 4 — Clear cookie
        this.clearRefreshCookie(response);

        const now = new Date();
        this.authEventDispatcher.dispatchLogout({
            userId: payload.sub,
            sessionId: payload.sessionId,
            timestamp: now,
        });

        this.authEventDispatcher.dispatchSessionRevoked({
            sessionId: payload.sessionId,
            revokedBy: 'user',
            timestamp: now,
        });
    }

    /**
     * Revokes every active session belonging to the authenticated user.
     *
     * Flow (§15):
     *  1. Verify Refresh Token JWT to obtain the user ID
     *  2. Bulk-update all active sessions for that user to Revoked
     *  3. Clear the rt HttpOnly cookie
     *
     * @param refreshToken  Raw Refresh Token from the rt cookie.
     * @param response      HTTP response for cookie removal.
     */
    async logoutAll(refreshToken: string, response: Response): Promise<void> {
        // Step 1 — Verify signature; extract userId (sub)
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);

        // Step 2 — Bulk-revoke: single UPDATE targeting all active sessions
        // for this user, avoiding N+1 loads.
        const now = new Date();
        await this.sessionRepository
            .createQueryBuilder()
            .update(Session)
            .set({
                status: SessionStatus.Revoked,
                revokedAt: now,
            })
            .where('user_id = :userId', { userId: payload.sub })
            .andWhere('status = :status', { status: SessionStatus.Active })
            .execute();

        // Step 3 — Clear cookie
        this.clearRefreshCookie(response);

        this.authEventDispatcher.dispatchLogoutAll({
            userId: payload.sub,
            sessionId: payload.sessionId, // The initiating session
            timestamp: now,
        });

        this.authEventDispatcher.dispatchSessionRevoked({
            sessionId: payload.sessionId,
            revokedBy: 'user',
            timestamp: now,
        });
    }

    /**
     * Changes the user's password.
     *
     * Validates the old password matches the database record, hashes the new password
     * using Argon2id, and handles clearing the mustChangePassword flag.
     *
     * @param userId The ID of the authenticated user.
     * @param dto The change password DTO.
     */
    async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User no longer exists.');
        }

        this.assertUserNotInactive(user);

        const isOldPasswordValid = await this.passwordService.verifyPassword(
            dto.oldPassword,
            user.passwordHash,
        );

        if (!isOldPasswordValid) {
            throw new BadRequestException('Incorrect current password.');
        }

        user.passwordHash = await this.passwordService.hashPassword(dto.newPassword);
        user.mustChangePassword = false;

        await this.userRepository.save(user);

        this.authEventDispatcher.dispatchPasswordChange({
            userId: user.id,
            timestamp: new Date(),
        });
    }

    /**
     * Resets a user's password to a secure temporary password.
     *
     * Authorization is enforced at the controller layer via `users.update`.
     * Resets the target user's password hash, forces a password change on next
     * login, unlocks the account, and returns the generated temporary password.
     *
     * @param adminUserId The ID of the authenticated user performing the reset.
     * @param targetUserId The ID of the user whose password should be reset.
     */
    async adminResetPassword(
        adminUserId: string,
        targetUserId: string,
    ): Promise<AdminResetPasswordResponseDto> {
        const targetUser = await this.userRepository.findOne({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            throw new NotFoundException('Target user profile not found.');
        }

        // Generate dynamic policy-compliant temporary password
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const specials = '!@#$%^&*';
        const all = letters + digits + specials;

        let pwd = '';
        pwd += letters[crypto.randomInt(0, letters.length)];
        pwd += digits[crypto.randomInt(0, digits.length)];
        pwd += specials[crypto.randomInt(0, specials.length)];
        for (let i = 0; i < 9; i++) {
            pwd += all[crypto.randomInt(0, all.length)];
        }

        // Shuffle the characters securely
        const temporaryPassword = pwd
            .split('')
            .sort(() => crypto.randomBytes(1)[0] - 128)
            .join('');

        // Apply temporary pass, lock reset, and force update criteria
        targetUser.passwordHash = await this.passwordService.hashPassword(temporaryPassword);
        targetUser.mustChangePassword = true;
        targetUser.failedLoginAttempts = 0;
        targetUser.lockedUntil = null;

        await this.userRepository.save(targetUser);

        await this.revokeAllActiveSessions(targetUser.id, 'admin');

        this.authEventDispatcher.dispatchPasswordReset({
            adminUserId,
            targetUserId: targetUser.id,
            timestamp: new Date(),
        });

        return { temporaryPassword };
    }

    // -----------------------------------------------------------------------
    // Private helpers — session validation
    // -----------------------------------------------------------------------

    /**
     * Loads a session by ID and validates that it is currently active.
     *
     * Throws UnauthorizedException for any non-active state so that the
     * client cannot distinguish between revoked, expired, or non-existent
     * sessions (prevents session enumeration).
     */
    private async loadActiveSession(sessionId: string): Promise<Session> {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
        });

        if (session?.status !== SessionStatus.Active) {
            throw new UnauthorizedException('Session is invalid or has been revoked');
        }

        return session;
    }

    /**
     * Validates, locks, and rotates a refresh token inside a single transaction.
     *
     * Uses a pessimistic write lock on the session row so concurrent refresh
     * requests cannot issue multiple access tokens for the same session.
     */
    private async rotateRefreshTokenWithLock(
        manager: EntityManager,
        refreshToken: string,
        payload: JwtPayload,
    ): Promise<RefreshRotationResult> {
        const sessionRepo = manager.getRepository(Session);

        const session = await sessionRepo.findOne({
            where: { id: payload.sessionId },
            lock: { mode: 'pessimistic_write' },
        });

        if (session?.status !== SessionStatus.Active) {
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        if (session.expiresAt <= new Date()) {
            session.status = SessionStatus.Expired;
            await sessionRepo.save(session);
            this.authEventDispatcher.dispatchSessionExpired({
                sessionId: session.id,
                userId: payload.sub,
                timestamp: new Date(),
            });
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        const isHashValid = await this.passwordService.verifyPassword(
            refreshToken,
            session.refreshTokenHash,
        );

        if (!isHashValid) {
            const revokedAt = new Date();
            session.status = SessionStatus.Revoked;
            session.revokedAt = revokedAt;
            await sessionRepo.save(session);

            this.authEventDispatcher.dispatchSessionRevoked({
                sessionId: session.id,
                revokedBy: 'replay',
                timestamp: revokedAt,
            });

            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        const userRepo = manager.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: payload.sub },
        });

        if (user?.status !== UserStatus.Active) {
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        const newPayload: JwtPayload = {
            sub: user.id,
            sessionId: session.id,
            username: user.username,
        };

        const { accessToken, refreshToken: newRefreshToken } =
            await this.tokenService.generateTokenPair(newPayload);

        session.refreshTokenHash = await this.passwordService.hashPassword(newRefreshToken);
        session.lastActivityAt = new Date();
        await sessionRepo.save(session);

        return { accessToken, refreshToken: newRefreshToken };
    }

    /**
     * Revokes every active session for a user and emits SessionRevoked events.
     */
    private async revokeAllActiveSessions(
        userId: string,
        revokedBy: string,
    ): Promise<void> {
        const activeSessions = await this.sessionRepository.find({
            where: { userId, status: SessionStatus.Active },
            select: ['id'],
        });

        if (activeSessions.length === 0) {
            return;
        }

        const revokedAt = new Date();
        await this.sessionRepository
            .createQueryBuilder()
            .update(Session)
            .set({
                status: SessionStatus.Revoked,
                revokedAt,
            })
            .where('user_id = :userId', { userId })
            .andWhere('status = :status', { status: SessionStatus.Active })
            .execute();

        for (const activeSession of activeSessions) {
            this.authEventDispatcher.dispatchSessionRevoked({
                sessionId: activeSession.id,
                revokedBy,
                timestamp: revokedAt,
            });
        }
    }

    // -----------------------------------------------------------------------
    // Private helpers — cookie
    // -----------------------------------------------------------------------

    /**
     * Sets the `rt` HttpOnly Secure SameSite=Strict cookie holding the raw
     * Refresh Token.
     *
     * The cookie lifetime matches the JWT expiry so browsers auto-discard it.
     * Max-Age is 30 days expressed in seconds.
     */
    private setRefreshCookie(response: Response, refreshToken: string): void {
        const options: CookieOptions = {
            httpOnly: true,
            secure: this.authConfig.cookieSecure,
            sameSite: 'strict',
            maxAge: this.authConfig.jwtRefreshExpiresInMs,
            path: '/',
        };

        response.cookie(this.authConfig.cookieName, refreshToken, options);
    }

    /**
     * Removes the `rt` HttpOnly cookie by overwriting it with an
     * expired / zero-age value.  Browsers delete cookies when maxAge is 0.
     */
    private clearRefreshCookie(response: Response): void {
        response.clearCookie(this.authConfig.cookieName, {
            httpOnly: true,
            secure: this.authConfig.cookieSecure,
            sameSite: 'strict',
            path: '/',
        });
    }

    // -----------------------------------------------------------------------
    // Private helpers — user validation
    // -----------------------------------------------------------------------

    /**
     * Loads a user by normalised username.
     *
     * Returns null when the username does not exist so callers can apply
     * uniform failure handling without revealing account existence.
     */
    private async loadUserByUsername(username: string): Promise<User | null> {
        const normalized = username.trim().toLowerCase();

        return this.userRepository.findOne({
            where: { username: normalized },
        });
    }

    /**
     * Returns a detailed login-failure reason for audit logging, or null when
     * the account may proceed to password validation.
     *
     * Expired lock windows are cleared in-memory; persistence happens on success.
     */
    private getLoginBlockReason(user: User): string | null {
        if (user.status === UserStatus.Inactive) {
            return 'Inactive account';
        }

        if (user.status !== UserStatus.Locked) {
            return null;
        }

        const now = new Date();

        if (user.lockedUntil && user.lockedUntil > now) {
            return 'Locked account';
        }

        user.status = UserStatus.Active;
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;

        return null;
    }

    /** Rejects inactive accounts (disabled by an administrator). */
    private assertUserNotInactive(user: User): void {
        if (user.status === UserStatus.Inactive) {
            throw new ForbiddenException(
                'Your account has been disabled. Contact your administrator.',
            );
        }
    }

    /**
     * Increments the failed-attempts counter and locks the account when the
     * configured threshold is reached.
     */
    private async handleFailedAttempt(user: User): Promise<void> {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            user.status = UserStatus.Locked;
            user.lockedUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS);
            this.authEventDispatcher.dispatchAccountLocked({
                userId: user.id,
                username: user.username,
                timestamp: new Date(),
            });
        }

        try {
            await this.userRepository.save(user);
        } catch {
            throw new InternalServerErrorException(
                'Failed to record login attempt',
            );
        }
    }

    /** Resets failed-attempt tracking after a successful password verification. */
    private async resetFailedAttempts(user: User): Promise<void> {
        if (user.failedLoginAttempts === 0 && user.status === UserStatus.Active) {
            return; // Nothing to reset — avoid unnecessary DB write
        }

        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        user.status = UserStatus.Active;

        await this.userRepository.save(user);
    }

    /**
     * Creates and persists a new Session record.
     *
     * `refreshTokenHash` is stored as an empty string initially and updated
     * after the token pair is generated to keep the session ID available for
     * payload construction.
     */
    private async createSession(user: User, request: Request): Promise<Session> {
        const expiresAt = new Date(Date.now() + this.authConfig.jwtRefreshExpiresInMs);

        const ip =
            (request.headers['x-forwarded-for'] as string | undefined)
                ?.split(',')[0]
                ?.trim() ??
            request.socket.remoteAddress ??
            'unknown';

        const userAgent = request.headers['user-agent'] ?? 'unknown';

        const session = this.sessionRepository.create({
            userId: user.id,
            refreshTokenHash: '', // Filled in after token generation
            ipAddress: ip.slice(0, 45),
            userAgent: userAgent.slice(0, 500),
            device: null,
            operatingSystem: null,
            lastActivityAt: new Date(),
            expiresAt,
            revokedAt: null,
            status: SessionStatus.Active,
        });

        return this.sessionRepository.save(session);
    }
}
