import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { UserStatus } from '../../../common/enums/user-status.enum';
import { AuthConfig } from '../../../config/auth.config';
import { User } from '../../users/entities/user.entity';
import { Session } from '../entities/session.entity';
import { SessionStatus } from '../enums/session-status.enum';
import { AuthEventDispatcher } from '../events/auth-event-dispatcher';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Passport strategy implementing JWT Access Token validation.
 *
 * Performs request validation pipeline (§17):
 *  1. Signature check & expiry check (delegated to Passport via Strategy options)
 *  2. Session validation (not revoked, not expired)
 *  3. User status validation (must be active)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
        private readonly authEventDispatcher: AuthEventDispatcher,
    ) {
        const authCfg = configService.get<AuthConfig>('auth');
        if (!authCfg?.jwtAccessSecret) {
            throw new Error('JWT Access Secret is missing from environment configurations.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: authCfg.jwtAccessSecret,
        });
    }

    /**
     * Post-verification validation hook. Runs automatically after Passport
     * successfully verifies the JWT signature and expiration.
     *
     * Performs DB assertions on user status and session status.
     *
     * @param payload Verified token payload.
     * @returns Authenticated user entity.
     */
    async validate(payload: JwtPayload): Promise<User> {
        // Step 2 — Validate Session Status
        const session = await this.sessionRepository.findOne({
            where: { id: payload.sessionId },
        });

        if (!session) {
            throw new UnauthorizedException('Session not found.');
        }

        if (session.status !== SessionStatus.Active || session.revokedAt !== null) {
            throw new UnauthorizedException('Session is inactive or has been revoked.');
        }

        // Step 3 — Load User & Validate User Status
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
        });

        if (!user) {
            throw new UnauthorizedException('User associated with this session no longer exists.');
        }

        if (session.expiresAt <= new Date()) {
            // Lazy transition to expired status in DB
            session.status = SessionStatus.Expired;
            void this.sessionRepository.save(session);
            this.authEventDispatcher.dispatchSessionExpired({
                sessionId: session.id,
                userId: user.id,
                timestamp: new Date(),
            });
            throw new UnauthorizedException('Session has expired.');
        }

        if (user.status !== UserStatus.Active) {
            throw new UnauthorizedException('User account is locked or disabled.');
        }

        // Inject the active session onto the request pipeline
        // (Passport will attach the returned user to req.user)
        return user;
    }
}
