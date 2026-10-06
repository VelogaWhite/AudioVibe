import { Module } from '@nestjs/common';
import { SpotifyModule } from '../spotify/spotify.module.js';
import { AudioFeatureService } from './audio-feature.service.js';
import { TrackController } from './track.controller.js';
import { TrackService } from './track.service.js';

@Module({
  imports: [SpotifyModule],
  controllers: [TrackController],
  providers: [TrackService, AudioFeatureService],
  exports: [TrackService, AudioFeatureService],
})
export class TrackModule {}
