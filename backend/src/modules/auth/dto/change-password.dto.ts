import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

/**
 * Request payload for POST /auth/change-password.
 */
export class ChangePasswordDto {
    @ApiProperty({
        description: 'The current account password.',
        example: 'OldPass123',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    oldPassword!: string;

    @ApiProperty({
        description: 'The new password complying with security policy.',
        example: 'NewPass456',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
        message: 'newPassword must contain at least one letter and one number',
    })
    newPassword!: string;
}
