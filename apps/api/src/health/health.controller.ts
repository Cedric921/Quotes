import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthCheckResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.healthService.checkHealth();
  }

  @Get('ping')
  ping(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  async getStats() {
    return this.healthService.getStats();
  }
}

