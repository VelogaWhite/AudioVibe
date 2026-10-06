import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { SpotifyModule } from './spotify/spotify.module.js';
import { UsersModule } from './users/users.module.js';
import { PlaylistModule } from './playlist/playlist.module.js';
import { TrackModule } from './track/track.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    SpotifyModule,
    UsersModule,
    PlaylistModule,
    TrackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
