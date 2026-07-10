import { ApiProperty } from '@nestjs/swagger';

/**
 * Response payload for a successful POST /auth/refresh.
 *
 * Returns the new Access Token in the body.
 * The rotated Refresh Token is delivered as an HttpOnly Secure cookie.
 */
export class RefreshResponseDto {
    @ApiProperty({
        description: 'New short-lived JWT Access Token.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…',
    })
    accessToken!: string;
}
