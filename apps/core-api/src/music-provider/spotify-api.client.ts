import { Injectable } from '@nestjs/common';

type SpotifySearchResponse = {
  tracks: {
    items: unknown[];
  };
};

type SpotifyAudioFeaturesResponse = {
  audio_features?: Array<Record<string, unknown> | null>;
};

@Injectable()
export class SpotifyApiClient {
  private readonly baseUrl = 'https://api.spotify.com/v1';

  private async request<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      void errorBody;
      throw new Error(`Spotify API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async getUserProfile(accessToken: string) {
    return this.request('/me', accessToken);
  }

  async createSpotifyPlaylist(
    name: string,
    isPublic: boolean,
    accessToken: string,
  ): Promise<{ id: string }> {
    return this.request(
      '/me/playlists',
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          public: isPublic,
        }),
      },
    );
  }

  async addItemsToPlaylist(
    playlistId: string,
    trackUris: string[],
    accessToken: string,
  ): Promise<{ snapshot_id: string }> {
    return this.request(
      `/playlists/${encodeURIComponent(playlistId)}/items`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          uris: trackUris,
        }),
      },
    );
  }

  async fetchAudioFeatures(trackIds: string[], accessToken: string) {
    if (trackIds.length === 0) {
      return [];
    }

    const ids = trackIds.map(encodeURIComponent).join(',');

    const response = await this.request<SpotifyAudioFeaturesResponse>(
      `/audio-features?ids=${ids}`,
      accessToken,
    );
    return response.audio_features ?? [];
  }

  async searchTracks(
    query: string,
    limit: number,
    accessToken: string,
  ) {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: String(limit),
    });

    const response = await this.request<SpotifySearchResponse>(
      `/search?${params.toString()}`,
      accessToken,
    );

    return response.tracks.items;
  }
}
