import { ApiProperty } from '@nestjs/swagger';

/**
 * Response payload containing the generated temporary password.
 */
export class AdminResetPasswordResponseDto {
    @ApiProperty({
        description: 'The secure generated temporary password.',
        example: 'tEmp928$z1a',
    })
    temporaryPassword!: string;
}
