import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getRoot() {
    return {
      status: 'ok',
      endpoint: '/user/:username',
      message: 'Use GET /user/:username to fetch a GitHub profile.',
    };
  }

  @Get('user/:username')
  getProfile(@Param('username') username: string) {
    return this.profileService.getProfile(username);
  }
}
