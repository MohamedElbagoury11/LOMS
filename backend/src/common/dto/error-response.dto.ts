import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Indicates that the request failed.',
  })
  success!: false;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Human-readable error message.',
  })
  message!: string;

  @ApiProperty({
    example: ['name must not be empty'],
    description: 'Detailed validation or business errors.',
    type: [String],
  })
  errors!: string[];
}
