import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SpotifyAuthService } from './spotify-auth.service.js';

@Controller('auth/spotify')
export class SpotifyAuthController {
  constructor(
    private readonly spotifyAuthService: SpotifyAuthService,
  ) {}

  @Get('login')
  login(@Res() response: Response) {
    const authorizationUrl =
      this.spotifyAuthService.getAuthorizationUrl();

    return response.redirect(authorizationUrl);
  }

@Get('callback')
async callback(@Query('code') code: string) {
  const tokenData =
    await this.spotifyAuthService.exchangeCodeForToken(code);

  const profile =
    await this.spotifyAuthService.getCurrentUserProfile(
      tokenData.access_token,
    );

  return {
    message: 'Spotify authentication successful',
    spotifyId: profile.id,
    displayName: profile.display_name,
    email: profile.email,
  };
}
}