import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { SpotifyModule } from './spotify/spotify.module.js';
import { UsersModule } from './users/users.module.js';
import { PlaylistModule } from './playlist/playlist.module.js';
import { TrackModule } from './track/track.module.js';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor.js';
import { PromptLogModule } from './prompt-log/prompt-log.module.js';

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
    PromptLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
})
export class AppModule {}
