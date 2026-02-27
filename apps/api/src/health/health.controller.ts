import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthCheckResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health
   * Returns the health status of all services
   */
  @Get()
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.healthService.checkHealth();
  }

  /**
   * GET /health/ping
   * Simple ping endpoint for load balancers
   */
  @Get('ping')
  ping(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

