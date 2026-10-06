import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SpotifyAdapter } from '../music-provider/spotify.adapter.js';

const FEATURES_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AudioFeatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly spotifyAdapter: SpotifyAdapter,
  ) {}

  async getForTracks(userId: string, trackIds: string[]) {
    const redis = this.redisService.getClient();
    const result = new Map<string, any>();
    const missing: string[] = [];

    for (const trackId of [...new Set(trackIds)]) {
      const cached = await redis.get(`track:features:${trackId}`);
      if (cached) {
        result.set(trackId, JSON.parse(cached));
      } else {
        missing.push(trackId);
      }
    }

    if (missing.length > 0) {
      const features = await this.spotifyAdapter.getAudioFeatures(
        userId,
        missing,
      );
      for (const feature of features) {
        await this.prisma.audioFeature.upsert({
          where: { trackId: feature.trackId },
          create: feature,
          update: feature,
        });
        await redis.set(
          `track:features:${feature.trackId}`,
          JSON.stringify(feature),
          'EX',
          FEATURES_CACHE_TTL_SECONDS,
        );
        result.set(feature.trackId, feature);
      }
    }

    return trackIds.flatMap((trackId) => {
      const feature = result.get(trackId);
      return feature ? [feature] : [];
    });
  }
}
