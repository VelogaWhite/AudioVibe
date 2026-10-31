import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { RedisService } from '../redis/redis.service.js';

const OAUTH_STATE_TTL_SECONDS = 10 * 60;

@Injectable()
export class SpotifyAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  private readonly scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify-private',
  ];

  constructor(private readonly redisService: RedisService) {
    this.clientId = process.env.SPOTIFY_CLIENT_ID ?? '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? '';
  }

  async getAuthorizationUrl(): Promise<string> {
    const state = randomBytes(32).toString('hex');
    await this.redisService
      .getClient()
      .set(`oauth:spotify:state:${state}`, 'valid', 'EX', OAUTH_STATE_TTL_SECONDS);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      show_dialog: 'true',
      state,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async consumeAuthorizationState(state: string): Promise<boolean> {
    if (!state) return false;

    const redis = this.redisService.getClient();
    const key = `oauth:spotify:state:${state}`;
    const value = await redis.get(key);
    if (value === null) return false;

    await redis.del(key);
    return true;
  }
  
  async exchangeCodeForToken(code: string) {
  const credentials = Buffer.from(
    `${this.clientId}:${this.clientSecret}`,
  ).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Spotify token exchange failed: ${response.status} ${errorBody}`,
    );
  }

  return response.json();
}
async refreshAccessToken(refreshToken: string) {
  const credentials = Buffer.from(
    `${this.clientId}:${this.clientSecret}`,
  ).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Spotify token refresh failed: ${response.status} ${errorBody}`,
    );
  }

  return response.json();
}
async getCurrentUserProfile(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Spotify profile request failed: ${response.status} ${errorBody}`,
    );
  }

  return response.json();
}
}
