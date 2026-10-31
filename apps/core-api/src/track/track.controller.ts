import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AudioFeatureService } from './audio-feature.service.js';

@Controller('tracks')
export class TrackController {
  constructor(private readonly audioFeatureService: AudioFeatureService) {}

  @Get('audio-features')
  getAudioFeatures(
    @Query('userId') userId: string,
    @Query('trackIds') trackIds: string,
  ) {
    const ids = trackIds?.split(',').map((id) => id.trim()).filter(Boolean);
    if (!userId || !ids?.length) {
      throw new BadRequestException('userId and trackIds are required');
    }
    return this.audioFeatureService.getForTracks(userId, ids);
  }
}
