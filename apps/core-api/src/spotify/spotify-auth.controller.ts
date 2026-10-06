import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SpotifyAuthService } from './spotify-auth.service.js';
import { UsersService } from '../users/users.service.js';

@Controller('auth/spotify')
export class SpotifyAuthController {
  constructor(
    private readonly spotifyAuthService: SpotifyAuthService,
    private readonly usersService: UsersService,
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

    const user = await this.usersService.findOrCreateUser({
      spotifyId: profile.id,
      email: profile.email ?? null,
      displayName: profile.display_name ?? null,
      profileImageUrl: profile.images?.[0]?.url ?? null,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: new Date(
        Date.now() + tokenData.expires_in * 1000,
      ),
    });

    return {
      message: 'Spotify authentication successful',
      userId: user.id,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      email: user.email,
    };
  }
}