import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AddPlaylistTracksRequestDTO } from '../dto/add-playlist-tracks-request.dto.js';
import { CreatePlaylistRequestDTO } from '../dto/create-playlist-request.dto.js';
import { ExportPlaylistRequestDTO } from '../dto/export-playlist-request.dto.js';
import { ReorderPlaylistTracksRequestDTO } from '../dto/reorder-playlist-tracks-request.dto.js';
import { TrackDTO } from '../dto/track.dto.js';
import { AudioFeaturesDTO } from '../dto/audio-features.dto.js';
import { UpdatePlaylistRequestDTO } from '../dto/update-playlist-request.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SpotifyAdapter } from '../music-provider/spotify.adapter.js';
import { TrackService } from '../track/track.service.js';

const SEARCH_CACHE_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class PlaylistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly musicProviderAdapter: SpotifyAdapter,
    private readonly redisService: RedisService,
    private readonly trackService: TrackService,
  ) {}

  async searchTracks(userId: string, query: string, limit: number) {
    const normalizedQuery = query.trim();
    const cacheInput = JSON.stringify({ version: 2, query: normalizedQuery, limit });
    const queryHash = createHash('sha256').update(cacheInput).digest('hex');
    const cacheKey = `search:${queryHash}`;
    const redis = this.redisService.getClient();
    const cached = await redis.get(cacheKey);
    if (cached !== null) return JSON.parse(cached) as TrackDTO[];

    const tracks = await this.musicProviderAdapter.searchTracks(userId, normalizedQuery, limit);
    await redis.set(cacheKey, JSON.stringify(tracks), 'EX', SEARCH_CACHE_TTL_SECONDS);
    return tracks;
  }

  async create(userId: string, request: CreatePlaylistRequestDTO) {
    await this.requireUser(userId);
    return this.prisma.playlist.create({
      data: { userId, name: request.name, description: request.description, isPublic: request.isPublic ?? true },
    });
  }

  async list(userId: string) {
    await this.requireUser(userId);
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { playlistTracks: { orderBy: { order: 'asc' }, include: { track: { include: { audioFeature: true } } } } },
    });
    return playlists.map((playlist) => this.toPlaylistResponse(playlist));
  }

  async get(userId: string, playlistId: string) {
    return this.toPlaylistResponse(await this.findOwnedPlaylist(userId, playlistId));
  }

  async update(userId: string, playlistId: string, request: UpdatePlaylistRequestDTO) {
    await this.findOwnedPlaylist(userId, playlistId);
    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...(request.name !== undefined ? { name: request.name } : {}),
        ...(request.description !== undefined ? { description: request.description } : {}),
        ...(request.isPublic !== undefined ? { isPublic: request.isPublic } : {}),
      },
    });
  }

  async remove(userId: string, playlistId: string) {
    await this.findOwnedPlaylist(userId, playlistId);
    await this.prisma.playlist.delete({ where: { id: playlistId } });
    return { deleted: true, playlistId };
  }

  async addTracks(userId: string, playlistId: string, request: AddPlaylistTracksRequestDTO) {
    await this.findOwnedPlaylist(userId, playlistId);
    const tracks = request.tracks ?? [];
    for (const track of tracks) await this.trackService.upsert(track);
    const ids = request.trackIds ?? tracks.map((track) => track.id);
    const existing = await this.prisma.playlistTrack.findMany({ where: { playlistId }, orderBy: { order: 'desc' }, take: 1 });
    let nextOrder = (existing[0]?.order ?? -1) + 1;
    for (const trackId of ids) {
      await this.prisma.playlistTrack.upsert({
        where: { playlistId_trackId: { playlistId, trackId } },
        create: { playlistId, trackId, order: nextOrder++ },
        update: {},
      });
    }
    return this.get(userId, playlistId);
  }

  async removeTrack(userId: string, playlistId: string, trackId: string) {
    await this.findOwnedPlaylist(userId, playlistId);
    await this.prisma.playlistTrack.delete({ where: { playlistId_trackId: { playlistId, trackId } } });
    return this.get(userId, playlistId);
  }

  async reorder(userId: string, playlistId: string, request: ReorderPlaylistTracksRequestDTO) {
    await this.findOwnedPlaylist(userId, playlistId);
    await this.prisma.$transaction(request.trackIds.map((trackId, order) => this.prisma.playlistTrack.update({ where: { playlistId_trackId: { playlistId, trackId } }, data: { order } })));
    return this.get(userId, playlistId);
  }

  async exportToSpotify(request: ExportPlaylistRequestDTO) {
    const playlist = await this.findOwnedPlaylist(request.userId, request.playlistId);
    const trackIds = request.trackIds.length > 0 ? request.trackIds : playlist.playlistTracks.map((item) => item.trackId);
    const spotifyPlaylistId = await this.musicProviderAdapter.createPlaylist(request.userId, request.name, request.isPublic);
    if (trackIds.length > 0) await this.musicProviderAdapter.addTracksToPlaylist(request.userId, spotifyPlaylistId, trackIds);
    const exported = await this.prisma.playlist.update({
      where: { id: playlist.id },
      data: { name: request.name, isPublic: request.isPublic, spotifyPlaylistId, isExported: true, exportedAt: new Date() },
      select: { id: true, spotifyPlaylistId: true, isExported: true, exportedAt: true },
    });
    return { playlistId: exported.id, ...exported };
  }

  private async requireUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new Error('User not found');
  }

  private async findOwnedPlaylist(userId: string, playlistId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId, userId },
      include: { playlistTracks: { orderBy: { order: 'asc' }, include: { track: { include: { audioFeature: true } } } } },
    });
    if (!playlist) throw new Error('Playlist not found');
    return playlist;
  }

  private toPlaylistResponse(playlist: any) {
    const tracks = playlist.playlistTracks.map((item: any) => this.trackService.toDto(item.track));
    const featureKeys: Array<keyof AudioFeaturesDTO> = ['danceability', 'valence', 'energy', 'acousticness', 'instrumentalness', 'liveness', 'speechiness'];
    const averageAudioFeatures = Object.fromEntries(featureKeys.map((key) => [key, tracks.length ? tracks.reduce((sum: number, track: TrackDTO) => sum + Number(track.audioFeatures?.[key] ?? 0), 0) / tracks.length : 0]));
    return { playlistId: playlist.id, name: playlist.name, tracks, averageAudioFeatures, isPublic: playlist.isPublic, isExported: playlist.isExported };
  }
}
