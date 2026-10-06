import { Injectable } from '@nestjs/common';
import { TrackDTO } from '../dto/track.dto.js';
import { UsersService } from '../users/users.service.js';
import { SpotifyTokenService } from '../spotify/spotify-token.service.js';
import {
  AudioFeaturesData,
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

  async getAudioFeatures(
    userId: string,
    trackIds: string[],
  ): Promise<AudioFeaturesData[]> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');
    const accessToken = await this.spotifyTokenService.getValidAccessToken(userId);
    const response = await this.spotifyApiClient.fetchAudioFeatures(
      trackIds,
      accessToken,
    );
    return response.flatMap((feature) => {
      if (!feature || typeof feature.id !== 'string') return [];
      return [{
        trackId: feature.id,
        danceability: Number(feature.danceability ?? 0),
        valence: Number(feature.valence ?? 0),
        energy: Number(feature.energy ?? 0),
        acousticness: Number(feature.acousticness ?? 0),
        instrumentalness: Number(feature.instrumentalness ?? 0),
        liveness: Number(feature.liveness ?? 0),
        speechiness: Number(feature.speechiness ?? 0),
        tempo: Number(feature.tempo ?? 0),
        loudness: Number(feature.loudness ?? 0),
      }];
    });
  }

async searchTracks(
  userId: string,
  query: string,
  limit: number,
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
    dto.albumName = String(album.name ?? 'Unknown album');
    dto.albumCoverUrl = String(album.images?.[0]?.url ?? '');
    dto.previewUrl = source.preview_url ?? null;
    dto.durationMs = Number(source.duration_ms ?? 0);
    dto.popularity = Number(source.popularity ?? 0);
    return dto;
  }
}
