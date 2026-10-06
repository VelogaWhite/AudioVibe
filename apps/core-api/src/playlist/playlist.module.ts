import { Module } from '@nestjs/common';
import { SpotifyModule } from '../spotify/spotify.module.js';
import { PlaylistController } from './playlist.controller.js';
import { PlaylistService } from './playlist.service.js';
import { TrackModule } from '../track/track.module.js';

@Module({
  imports: [SpotifyModule, TrackModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}
