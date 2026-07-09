import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse {
  @ApiProperty({
    example: true,
    description: 'Indicates that the request completed successfully.',
  })
  success!: true;

  @ApiProperty({
    example: 'Request completed successfully',
    description: 'Human-readable success message.',
  })
  message!: string;

  @ApiProperty({
    description: 'Response payload.',
    required: false,
  })
  data!: unknown;
}
