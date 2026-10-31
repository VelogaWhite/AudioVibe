import { Injectable } from '@nestjs/common';
import { TrackDTO } from '../dto/track.dto.js';
import { UsersService } from '../users/users.service.js';
import { SpotifyTokenService } from '../spotify/spotify-token.service.js';
import {
  SpotifyTrackMetadata,
  IMusicProviderAdapter,
} from './music-provider.adapter.js';
import { SpotifyApiClient } from './spotify-api.client.js';

@Injectable()
export class SpotifyAdapter implements IMusicProviderAdapter {
  constructor(
    private readonly spotifyApiClient: SpotifyApiClient,
    private readonly usersService: UsersService,
    private readonly spotifyTokenService: SpotifyTokenService,
  ) {}

  async createPlaylist(
    userId: string,
    name: string,
    isPublic: boolean,
  ): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');
    const accessToken = await this.spotifyTokenService.getValidAccessToken(userId);
    const response = await this.spotifyApiClient.createSpotifyPlaylist(
      name,
      isPublic,
      accessToken,
    );
    return response.id;
  }

  async addTracksToPlaylist(
    userId: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');
    const accessToken = await this.spotifyTokenService.getValidAccessToken(userId);
    await this.spotifyApiClient.addItemsToPlaylist(
      playlistId,
      trackIds.map((trackId) => `spotify:track:${trackId}`),
      accessToken,
    );
    return true;
  }

  async getTracksMetadata(
    userId: string,
    trackIds: string[],
  ): Promise<SpotifyTrackMetadata[]> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');
    const accessToken = await this.spotifyTokenService.getValidAccessToken(userId);
    const response = await this.spotifyApiClient.fetchTracksMetadata(
      trackIds,
      accessToken,
    );
    return response.flatMap((track) => {
      if (!track || typeof track.id !== 'string') return [];
      const album = (track.album ?? {}) as Record<string, unknown>;
      const artists = Array.isArray(track.artists) ? track.artists : [];
      const artist = artists[0] as Record<string, unknown> | undefined;
      const images = Array.isArray(album.images) ? album.images : [];
      const image = images[0] as Record<string, unknown> | undefined;
      return [{
        id: track.id,
        title: String(track.name ?? 'Unknown track'),
        artistName: String(artist?.name ?? 'Unknown artist'),
        albumName: typeof album.name === 'string' ? album.name : null,
        albumCoverUrl: typeof image?.url === 'string' ? image.url : null,
        durationMs: Number(track.duration_ms ?? 0),
        popularity: Number(track.popularity ?? 0),
      }];
    });
  }

async searchTracks(
  userId: string,
  query: string,
  limit: number,
  offset = 0,
): Promise<TrackDTO[]> {
  const user = await this.usersService.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

    const accessToken =
      await this.spotifyTokenService.getValidAccessToken(userId);

    const response = await this.spotifyApiClient.searchTracks(
    query,
    limit,
    accessToken,
    offset,
    ) as unknown;

    if (Array.isArray(response)) {
      return response.map((track) => this.toTrackDto(track));
    }

    const searchResponse = response as {
      tracks?: { items?: unknown[] };
    };

    const tracks = searchResponse.tracks?.items;
    if (Array.isArray(tracks)) {
      return tracks.map((track) => this.toTrackDto(track));
    }

    const responseKeys =
      response !== null && typeof response === 'object'
        ? Object.keys(response).join(',')
        : 'non-object';
    throw new Error(
      `Spotify search response did not contain tracks (keys: ${responseKeys})`,
    );
}

  private toTrackDto(track: unknown): TrackDTO {
    const source = track as Record<string, any>;
    const album = source.album ?? {};
    const artist = source.artists?.[0]?.name ?? 'Unknown artist';
    const dto = new TrackDTO();
    dto.id = String(source.id);
    dto.title = String(source.name ?? 'Unknown track');
    dto.artistName = artist;
    dto.albumName = typeof album.name === 'string' ? album.name : null;
    dto.albumCoverUrl = typeof album.images?.[0]?.url === 'string' ? album.images[0].url : null;
    dto.durationMs = Number(source.duration_ms ?? 0);
    dto.popularity = Number(source.popularity ?? 0);
    return dto;
  }
}
