import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ALLOW_PASSWORD_CHANGE_PENDING_KEY } from '../decorators/allow-password-change-pending.decorator';
import { User } from '../../users/entities/user.entity';

type AuthenticatedRequest = Request & {
    user?: User;
};

/**
 * Guard implementing JWT-based route access controls.
 *
 * Scans incoming HTTP requests for an Authorization Bearer header, validates
 * signature and expiry, and triggers session + user check pipeline in JwtStrategy.
 * Also enforces password change rules if user.mustChangePassword is true.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    override async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);
        if (!canActivate) {
            return false;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (user?.mustChangePassword) {
            const isAllowed = this.reflector.getAllAndOverride<boolean>(
                ALLOW_PASSWORD_CHANGE_PENDING_KEY,
                [context.getHandler(), context.getClass()],
            );

            if (!isAllowed) {
                throw new ForbiddenException(
                    'You must change your password before using the system.',
                );
            }
        }

        return true;
    }
}
