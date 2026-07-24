import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      endpoint: '/user/:username',
      message: 'Use GET /user/:username to fetch a GitHub profile.',
    };
  }
}
