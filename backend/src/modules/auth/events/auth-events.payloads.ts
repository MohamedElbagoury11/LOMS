export interface LoginEventPayload {
    userId: string;
    username: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}

export interface LogoutEventPayload {
    userId: string;
    sessionId: string;
    timestamp: Date;
}

export interface LogoutAllEventPayload {
    userId: string;
    sessionId: string;
    timestamp: Date;
}

export interface FailedLoginEventPayload {
    username: string;
    reason: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}

export interface PasswordChangeEventPayload {
    userId: string;
    timestamp: Date;
}

export interface PasswordResetEventPayload {
    adminUserId: string;
    targetUserId: string;
    timestamp: Date;
}

export interface RefreshEventPayload {
    userId: string;
    sessionId: string;
    timestamp: Date;
}

export interface AccountLockedEventPayload {
    userId: string;
    username: string;
    timestamp: Date;
}

export interface SessionExpiredEventPayload {
    sessionId: string;
    userId: string;
    timestamp: Date;
}

export interface SessionRevokedEventPayload {
    sessionId: string;
    revokedBy: string; // 'user' | 'admin' | 'timeout'
    timestamp: Date;
}
