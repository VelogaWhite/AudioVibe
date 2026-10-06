import { Injectable } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service.js';
import { UsersService } from '../users/users.service.js';
import { RedisService } from '../redis/redis.service.js';

const TOKEN_CACHE_TTL_SECONDS = 55 * 60;

@Injectable()
export class SpotifyTokenService {
  constructor(
    private readonly spotifyAuthService: SpotifyAuthService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async cacheAccessToken(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresInSeconds: number,
  ) {
    const tokenExpiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    );
    await this.redisService.getClient().set(
      `user:token:${userId}`,
      JSON.stringify({
        accessToken,
        refreshToken,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
      }),
      'EX',
      TOKEN_CACHE_TTL_SECONDS,
    );
  }

  async refreshUserAccessToken(spotifyId: string) {
    const user = await this.usersService.findBySpotifyId(spotifyId);

    if (!user) {
      throw new Error('User not found');
    }

    const tokenData =
      await this.spotifyAuthService.refreshAccessToken(
        user.refreshToken,
      );

    const tokenExpiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000,
    );

    await this.usersService.updateAccessToken(
      spotifyId,
      tokenData.access_token,
      tokenExpiresAt,
      tokenData.refresh_token,
    );

    const userCache = await this.usersService.findBySpotifyId(spotifyId);
    if (userCache) {
      await this.redisService.getClient().set(
        `user:token:${userCache.id}`,
        JSON.stringify({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token ?? userCache.refreshToken,
          tokenExpiresAt: tokenExpiresAt.toISOString(),
        }),
        'EX',
        TOKEN_CACHE_TTL_SECONDS,
      );
    }

    return tokenData;
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const cached = await this.redisService
      .getClient()
      .get(`user:token:${user.id}`);
    if (cached) {
      const cachedToken = JSON.parse(cached) as {
        accessToken?: string;
      };
      if (cachedToken.accessToken) {
        return cachedToken.accessToken;
      }
    }

    const refreshBufferMs = 60_000;
    if (user.tokenExpiresAt.getTime() > Date.now() + refreshBufferMs) {
      await this.redisService.getClient().set(
        `user:token:${user.id}`,
        JSON.stringify({
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          tokenExpiresAt: user.tokenExpiresAt.toISOString(),
        }),
        'EX',
        TOKEN_CACHE_TTL_SECONDS,
      );
      return user.accessToken;
    }

    const tokenData = await this.refreshUserAccessToken(user.spotifyId);
    return tokenData.access_token;
  }
}
