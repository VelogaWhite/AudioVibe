import { Module } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service.js';
import { SpotifyAuthController } from './spotify-auth.controller.js';

@Module({
  controllers: [SpotifyAuthController],
  providers: [SpotifyAuthService],
  exports: [SpotifyAuthService],
})
export class SpotifyModule {}