import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('latest/me')
  async getLatestUser() {
    const user = await this.usersService.findLatest();
    if (!user) throw new NotFoundException('No user found');

    return {
      id: user.id,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
    };
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
    };
  }
}
