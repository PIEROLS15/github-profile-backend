import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProfileModule } from './profile/profile.module';

@Module({
  controllers: [AppController],
  imports: [ProfileModule],
})
export class AppModule {}
