import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisService } from './redis/redis.service.js';
import { SpotifyModule } from './spotify/spotify.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SpotifyModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}