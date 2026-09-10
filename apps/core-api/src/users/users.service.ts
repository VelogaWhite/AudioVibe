import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SpotifyUserData } from './type/spotify-user-data.type.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(data: SpotifyUserData) {
    return this.prisma.user.upsert({
      where: {
        spotifyId: data.spotifyId,
      },
      update: {
        email: data.email,
        displayName: data.displayName,
        profileImageUrl: data.profileImageUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
      },
      create: {
        spotifyId: data.spotifyId,
        email: data.email,
        displayName: data.displayName,
        profileImageUrl: data.profileImageUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
      },
    });
  }
}