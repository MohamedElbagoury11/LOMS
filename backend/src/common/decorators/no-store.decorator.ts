import { applyDecorators, Header } from '@nestjs/common';

/**
 * Prevents clients and intermediaries from caching token-bearing responses.
 */
export function NoStore(): MethodDecorator {
    return applyDecorators(
        Header('Cache-Control', 'no-store'),
        Header('Pragma', 'no-cache'),
    );
}
