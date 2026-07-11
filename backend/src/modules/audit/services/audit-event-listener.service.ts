import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { AuthEventDispatcher } from '../../auth/events/auth-event-dispatcher';
import { AuthEvent } from '../../auth/events/auth-events.enum';
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
} from '../../auth/events/auth-events.payloads';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { AuditService } from './audit.service';

@Injectable()
export class AuditEventListenerService implements OnModuleInit {
    private readonly logger = new Logger(AuditEventListenerService.name);

    constructor(
        private readonly auditService: AuditService,
        private readonly authEventDispatcher: AuthEventDispatcher,
    ) {}

    onModuleInit(): void {
        this.authEventDispatcher.on(AuthEvent.LOGIN, (payload: LoginEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    userId: payload.userId,
                    username: payload.username,
                    action: AuditAction.LOGIN,
                    entity: AuditEntity.AUTH,
                    entityId: payload.sessionId,
                    ipAddress: payload.ipAddress,
                    userAgent: payload.userAgent,
                    details: { sessionId: payload.sessionId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.FAILED_LOGIN, (payload: FailedLoginEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logFailure({
                    username: payload.username,
                    action: AuditAction.LOGIN_FAILED,
                    entity: AuditEntity.AUTH,
                    entityId: null,
                    ipAddress: payload.ipAddress,
                    userAgent: payload.userAgent,
                    details: { reason: payload.reason },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.REFRESH, (payload: RefreshEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    userId: payload.userId,
                    action: AuditAction.REFRESH_TOKEN,
                    entity: AuditEntity.AUTH,
                    entityId: payload.sessionId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { sessionId: payload.sessionId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.LOGOUT, (payload: LogoutEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    userId: payload.userId,
                    action: AuditAction.LOGOUT,
                    entity: AuditEntity.AUTH,
                    entityId: payload.sessionId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { sessionId: payload.sessionId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.LOGOUT_ALL, (payload: LogoutAllEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    userId: payload.userId,
                    action: AuditAction.LOGOUT_ALL,
                    entity: AuditEntity.AUTH,
                    entityId: payload.sessionId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { sessionId: payload.sessionId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.PASSWORD_CHANGE, (payload: PasswordChangeEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    userId: payload.userId,
                    action: AuditAction.PASSWORD_CHANGED,
                    entity: AuditEntity.AUTH,
                    entityId: payload.userId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { userId: payload.userId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.PASSWORD_RESET, (payload: PasswordResetEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    userId: payload.adminUserId,
                    action: AuditAction.PASSWORD_RESET,
                    entity: AuditEntity.USER,
                    entityId: payload.targetUserId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { targetUserId: payload.targetUserId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.SESSION_REVOKED, (payload: SessionRevokedEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logSuccess({
                    action: AuditAction.SESSION_REVOKED,
                    entity: AuditEntity.SESSION,
                    entityId: payload.sessionId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { revokedBy: payload.revokedBy },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.SESSION_EXPIRED, (payload: SessionExpiredEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logFailure({
                    userId: payload.userId,
                    action: AuditAction.SESSION_EXPIRED,
                    entity: AuditEntity.SESSION,
                    entityId: payload.sessionId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { sessionId: payload.sessionId },
                }),
            );
        });

        this.authEventDispatcher.on(AuthEvent.ACCOUNT_LOCKED, (payload: AccountLockedEventPayload) => {
            void this.recordAuditEvent(() =>
                this.auditService.logFailure({
                    userId: payload.userId,
                    username: payload.username,
                    action: AuditAction.ACCOUNT_LOCKED,
                    entity: AuditEntity.USER,
                    entityId: payload.userId,
                    ipAddress: 'unknown',
                    userAgent: 'unknown',
                    details: { username: payload.username },
                }),
            );
        });

        this.logger.log('Audit event listener registered');
    }

    private async recordAuditEvent(operation: () => Promise<unknown>): Promise<void> {
        try {
            await operation();
        } catch (error) {
            this.logger.warn(`Audit persistence failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
