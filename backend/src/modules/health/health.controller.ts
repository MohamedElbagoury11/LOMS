import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Check API health',
    description: 'Returns the current API health status and runtime timestamp.',
  })
  @ApiOkResponse({
    description: 'The API is running.',
    schema: {
      example: {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      },
    },
  })
  getHealth(): Promise<HealthCheckResult> {
    return this.healthService.getHealth();
  }
}
