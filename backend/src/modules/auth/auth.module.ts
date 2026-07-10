import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';

import { AuthConfig } from '../../config/auth.config';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { PasswordService } from './password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './token.service';

import { AuthEventDispatcher } from './events/auth-event-dispatcher';

/**
 * Authentication module.
 *
 * Owns the login flow, session management, password hashing, and token
 * generation/verification.  See docs/06-AUTHENTICATION_DESIGN.md for the
 * complete design specification.
 */
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const authCfg = config.get<AuthConfig>('auth');
                if (!authCfg) {
                    throw new Error('Auth configuration is missing');
                }
                return {
                    secret: authCfg.jwtAccessSecret,
                    signOptions: {
                        expiresIn: authCfg.jwtAccessExpiresIn as StringValue,
                    },
                };
            },
        }),
        TypeOrmModule.forFeature([Session, User]),
    ],
    controllers: [AuthController],
    providers: [AuthService, PasswordService, TokenService, JwtStrategy, AuthEventDispatcher],
    exports: [AuthService, PasswordService, TokenService, JwtStrategy, JwtModule, PassportModule, TypeOrmModule, AuthEventDispatcher],
})
export class AuthModule { }
