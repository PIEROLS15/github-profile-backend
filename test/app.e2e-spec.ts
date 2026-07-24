import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ProfileService } from '../src/profile/profile.service';

describe('ProfileController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const profileService = {
      getProfile: jest.fn().mockResolvedValue({
        username: 'octocat',
        name: 'The Octocat',
        bio: 'GitHub mascot',
        avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
        profileUrl: 'https://github.com/octocat',
        company: null,
        blog: null,
        location: 'San Francisco',
        publicRepos: 8,
        publicGists: 1,
        followers: 100,
        following: 0,
        createdAt: '2011-01-25T18:44:36Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProfileService)
      .useValue(profileService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/user/:username (GET)', () => {
    return request(app.getHttpServer())
      .get('/user/octocat')
      .expect(200)
      .expect(({ body }) => {
        expect(body.username).toBe('octocat');
        expect(body.followers).toBe(100);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
