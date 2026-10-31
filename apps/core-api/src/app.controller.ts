import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { RedisService } from './redis/redis.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  getHello() {
    return 'Hello World!';
  }

  @Get('health')
  async health() {
    const checks = { postgres: false, redis: false };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = true;
    } catch {
      // Keep the response safe and actionable without exposing connection details.
    }

    try {
      checks.redis = (await this.redis.getClient().ping()) === 'PONG';
    } catch {
      // Keep the response safe and actionable without exposing connection details.
    }

    const healthy = checks.postgres && checks.redis;
    if (!healthy) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks,
      });
    }

    return { status: 'ok', checks };
  }
}
