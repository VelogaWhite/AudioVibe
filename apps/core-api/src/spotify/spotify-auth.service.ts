import { Injectable } from '@nestjs/common';

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

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID ?? '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? '';
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
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