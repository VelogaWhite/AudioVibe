import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SpotifyUserData } from './type/spotify-user-data.type.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(data: SpotifyUserData) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        spotifyId: data.spotifyId,
      },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: {
          spotifyId: data.spotifyId,
        },
        data: {
          email: data.email,
          displayName: data.displayName,
          profileImageUrl: data.profileImageUrl,
          accessToken: data.accessToken,
          ...(data.refreshToken
            ? { refreshToken: data.refreshToken }
            : {}),
          tokenExpiresAt: data.tokenExpiresAt,
        },
      });
    }

    if (!data.refreshToken) {
      throw new Error(
        'Spotify did not provide refresh token for new user',
      );
    }

    return this.prisma.user.create({
      data: {
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

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findBySpotifyId(spotifyId: string) {
    return this.prisma.user.findUnique({
      where: {
        spotifyId: spotifyId,
      },
    });
  }

  async updateAccessToken(
    spotifyId: string,
    accessToken: string,
    tokenExpiresAt: Date,
    refreshToken?: string,
  ) {
    return this.prisma.user.update({
      where: {
        spotifyId,
      },
      data: {
        accessToken,
        tokenExpiresAt,
        ...(refreshToken ? { refreshToken } : {}),
      },
    });
  }
}
