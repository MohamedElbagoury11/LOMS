import { ApiProperty } from '@nestjs/swagger';

/**
 * Response payload for a successful POST /auth/login.
 *
 * Returns only the Access Token per docs/06-AUTHENTICATION_DESIGN.md §5.
 * The Refresh Token is sent as an HttpOnly Secure cookie.
 */
export class LoginResponseDto {
    @ApiProperty({
        description: 'Short-lived JWT Access Token. Send as Authorization: Bearer <token>.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…',
    })
    accessToken!: string;

    @ApiProperty({
        description: 'Unique identifier for the created session.',
        example: 'a1b2c3d4-0000-0000-0000-ffffffffffff',
    })
    sessionId!: string;

    @ApiProperty({
        description: 'Whether the user must change their password before accessing any other resource.',
        example: false,
    })
    mustChangePassword!: boolean;
}
