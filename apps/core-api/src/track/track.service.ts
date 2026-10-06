import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TrackDTO } from '../dto/track.dto.js';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(track: TrackDTO) {
    return this.prisma.track.upsert({
      where: { id: track.id },
      create: {
        id: track.id,
        title: track.title,
        artistName: track.artistName,
        albumName: track.albumName,
        albumCoverUrl: track.albumCoverUrl,
        previewUrl: track.previewUrl,
        durationMs: track.durationMs,
        popularity: track.popularity,
      },
      update: {
        title: track.title,
        artistName: track.artistName,
        albumName: track.albumName,
        albumCoverUrl: track.albumCoverUrl,
        previewUrl: track.previewUrl,
        durationMs: track.durationMs,
        popularity: track.popularity,
      },
    });
  }

  async findByIds(ids: string[]) {
    return this.prisma.track.findMany({
      where: { id: { in: ids } },
      include: { audioFeature: true },
    });
  }

  toDto(track: any): TrackDTO {
    const dto = new TrackDTO();
    dto.id = track.id;
    dto.title = track.title;
    dto.artistName = track.artistName;
    dto.albumName = track.albumName;
    dto.albumCoverUrl = track.albumCoverUrl;
    dto.previewUrl = track.previewUrl;
    dto.durationMs = track.durationMs;
    dto.popularity = track.popularity;
    dto.audioFeatures = track.audioFeature ?? null;
    return dto;
  }
}
