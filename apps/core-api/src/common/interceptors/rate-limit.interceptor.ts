import {
  CallHandler,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { RedisService } from '../../redis/redis.service.js';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 120;

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const route = `${request.method}:${request.baseUrl}${request.path}`;
    const key = `rate:${clientIp}:${route}`;

    try {
      const redis = this.redisService.getClient();
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
      }
      if (count > RATE_LIMIT_MAX_REQUESTS) {
        throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      // Keep the API available if Redis is temporarily unavailable.
    }

    return next.handle();
  }
}
