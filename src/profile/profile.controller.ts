import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('user/:username')
  getProfile(@Param('username') username: string) {
    return this.profileService.getProfile(username);
  }
}
