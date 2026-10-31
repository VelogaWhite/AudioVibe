import { Module } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service.js';
import { SpotifyAuthController } from './spotify-auth.controller.js';
import { SpotifyTokenService } from './spotify-token.service.js';
import { UsersModule } from '../users/users.module.js';
import { SpotifyApiClient } from '../music-provider/spotify-api.client.js';
import { SpotifyAdapter } from '../music-provider/spotify.adapter.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [UsersModule, RedisModule],
  controllers: [SpotifyAuthController],
  providers: [
    SpotifyAuthService,
    SpotifyTokenService,
    SpotifyApiClient,
    SpotifyAdapter,
  ],
  exports: [
    SpotifyAuthService,
    SpotifyTokenService,
    SpotifyAdapter,
  ],
})
export class SpotifyModule {}
