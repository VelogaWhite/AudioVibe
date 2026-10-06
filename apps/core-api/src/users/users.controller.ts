import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
