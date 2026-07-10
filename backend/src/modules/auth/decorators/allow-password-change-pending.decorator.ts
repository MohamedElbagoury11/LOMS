import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ALLOW_PASSWORD_CHANGE_PENDING_KEY = 'allowPasswordChangePending';

/**
 * Decorator to permit access to specific authenticated routes even if the user
 * has mustChangePassword = true.
 */
export const AllowPasswordChangePending = (): CustomDecorator =>
    SetMetadata(ALLOW_PASSWORD_CHANGE_PENDING_KEY, true);
