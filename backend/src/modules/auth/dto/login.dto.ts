import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

/**
 * Request body for POST /auth/login.
 *
 * Validates username and password per docs/06-AUTHENTICATION_DESIGN.md §9.
 */
export class LoginDto {
    @ApiProperty({
        description: 'System username (case-insensitive).',
        example: 'john.smith',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    username!: string;

    @ApiProperty({
        description: 'Account password (min 8 chars, at least one letter and one digit).',
        example: 'Secret123',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
        message: 'password must contain at least one letter and one number',
    })
    password!: string;
}
