import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

import { AuthEvent } from './auth-events.enum';
import {
    AccountLockedEventPayload,
    FailedLoginEventPayload,
    LoginEventPayload,
    LogoutAllEventPayload,
    LogoutEventPayload,
    PasswordChangeEventPayload,
    PasswordResetEventPayload,
    RefreshEventPayload,
    SessionExpiredEventPayload,
    SessionRevokedEventPayload,
} from './auth-events.payloads';

/**
 * Event dispatcher for authentication events.
 *
 * Implements a lightweight event bus using Node's native EventEmitter
 * to avoid external third-party dependencies while preserving complete type-safety.
 *
 * The будущего Audit module will inject this dispatcher and subscribe to target events.
 */
@Injectable()
export class AuthEventDispatcher extends EventEmitter {
    private readonly logger = new Logger(AuthEventDispatcher.name);

    dispatchLogin(payload: LoginEventPayload): void {
        this.logger.log(`Dispatching LOGIN event for user ${payload.username}`);
        this.emit(AuthEvent.LOGIN, payload);
    }

    dispatchLogout(payload: LogoutEventPayload): void {
        this.logger.log(`Dispatching LOGOUT event for user ${payload.userId}`);
        this.emit(AuthEvent.LOGOUT, payload);
    }

    dispatchLogoutAll(payload: LogoutAllEventPayload): void {
        this.logger.log(`Dispatching LOGOUT_ALL event for user ${payload.userId}`);
        this.emit(AuthEvent.LOGOUT_ALL, payload);
    }

    dispatchFailedLogin(payload: FailedLoginEventPayload): void {
        this.logger.log(`Dispatching FAILED_LOGIN event for user ${payload.username}`);
        this.emit(AuthEvent.FAILED_LOGIN, payload);
    }

    dispatchPasswordChange(payload: PasswordChangeEventPayload): void {
        this.logger.log(`Dispatching PASSWORD_CHANGE event for user ${payload.userId}`);
        this.emit(AuthEvent.PASSWORD_CHANGE, payload);
    }

    dispatchPasswordReset(payload: PasswordResetEventPayload): void {
        this.logger.log(`Dispatching PASSWORD_RESET event by admin ${payload.adminUserId} for user ${payload.targetUserId}`);
        this.emit(AuthEvent.PASSWORD_RESET, payload);
    }

    dispatchRefresh(payload: RefreshEventPayload): void {
        this.logger.log(`Dispatching REFRESH event for session ${payload.sessionId}`);
        this.emit(AuthEvent.REFRESH, payload);
    }

    dispatchAccountLocked(payload: AccountLockedEventPayload): void {
        this.logger.log(`Dispatching ACCOUNT_LOCKED event for user ${payload.username}`);
        this.emit(AuthEvent.ACCOUNT_LOCKED, payload);
    }

    dispatchSessionExpired(payload: SessionExpiredEventPayload): void {
        this.logger.log(`Dispatching SESSION_EXPIRED event for session ${payload.sessionId}`);
        this.emit(AuthEvent.SESSION_EXPIRED, payload);
    }

    dispatchSessionRevoked(payload: SessionRevokedEventPayload): void {
        this.logger.log(`Dispatching SESSION_REVOKED event for session ${payload.sessionId}`);
        this.emit(AuthEvent.SESSION_REVOKED, payload);
    }
}
