import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AddPlaylistTracksRequestDTO } from '../dto/add-playlist-tracks-request.dto.js';
import { CreatePlaylistRequestDTO } from '../dto/create-playlist-request.dto.js';
import { ExportPlaylistRequestDTO } from '../dto/export-playlist-request.dto.js';
import { ReorderPlaylistTracksRequestDTO } from '../dto/reorder-playlist-tracks-request.dto.js';
import { UpdatePlaylistRequestDTO } from '../dto/update-playlist-request.dto.js';
import { PlaylistService } from './playlist.service.js';

@Controller()
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get('playlists/search')
  @Get('tracks/search')
  searchTracks(
    @Query('userId') userId: string,
    @Query('query') query: string,
    @Query('limit') rawLimit = '20',
    @Query('offset') rawOffset = '0',
  ) {
    const limit = Number(rawLimit);
    const offset = Number(rawOffset);
    if (!userId || !query?.trim() || !Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0) {
      throw new BadRequestException('userId, query, limit (1-50) and offset (0 or greater) are required');
    }
    return this.playlistService.searchTracks(userId, query, limit, offset);
  }

  @Get('playlists')
  list(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.playlistService.list(userId);
  }

  @Post('playlists')
  create(@Body() request: CreatePlaylistRequestDTO) { return this.playlistService.create(request.userId, request); }

  @Get('playlists/:id')
  get(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.playlistService.get(userId, id);
  }

  @Patch('playlists/:id')
  update(@Param('id') id: string, @Body() request: UpdatePlaylistRequestDTO) { return this.playlistService.update(request.userId, id, request); }

  @Delete('playlists/:id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.playlistService.remove(userId, id);
  }

  @Post('playlists/:id/tracks')
  addTracks(@Param('id') id: string, @Body() request: AddPlaylistTracksRequestDTO) {
    if (!request.tracks?.length && !request.trackIds?.length) throw new BadRequestException('tracks or trackIds is required');
    return this.playlistService.addTracks(request.userId, id, request);
  }

  @Delete('playlists/:id/tracks/:trackId')
  removeTrack(@Param('id') id: string, @Param('trackId') trackId: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.playlistService.removeTrack(userId, id, trackId);
  }

  @Patch('playlists/:id/tracks/order')
  @Patch('playlists/:id/tracks/reorder')
  reorder(@Param('id') id: string, @Body() request: ReorderPlaylistTracksRequestDTO) { return this.playlistService.reorder(request.userId, id, request); }

  @Post('playlists/export')
  @Post('playlists/:id/export')
  export(@Body() request: ExportPlaylistRequestDTO) { return this.playlistService.exportToSpotify(request); }
}
