import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps the GitHub API response into the public contract', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes('/contributions?from=2026-01-01&to=2026-12-31')) {
        return new Response(
          '<div>3 contributions in 2026<ul><li>No contributions on January 1st.</li><li>3 contributions on January 2nd.</li></ul></div>',
          { status: 200, headers: { 'Content-Type': 'text/html' } },
        );
      }

      if (url.includes('/contributions?from=2025-01-01&to=2025-12-31')) {
        return new Response(
          '<div>0 contributions in 2025<ul><li>No contributions on January 1st.</li></ul></div>',
          { status: 200, headers: { 'Content-Type': 'text/html' } },
        );
      }

      if (url.includes('/contributions?from=2024-01-01&to=2024-12-31')) {
        return new Response(
          '<div>0 contributions in 2024<ul><li>No contributions on January 1st.</li></ul></div>',
          { status: 200, headers: { 'Content-Type': 'text/html' } },
        );
      }

      if (url.includes('/repos/octocat/octocat/readme')) {
        return new Response(
          JSON.stringify({
            content: Buffer.from('# Octocat\nHola').toString('base64'),
            html_url: 'https://github.com/octocat/octocat#readme',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url === 'https://github.com/octocat?tab=achievements') {
        return new Response(
          '<html><body><details data-achievement-slug="pull-shark"><img src="https://github.githubassets.com/images/modules/profile/achievements/pull-shark-default.png" alt="Achievement: Pull Shark" /></details><details data-achievement-slug="yolo"><img src="https://github.githubassets.com/images/modules/profile/achievements/yolo-default.png" alt="Achievement: YOLO" /></details></body></html>',
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          login: 'octocat',
          name: 'The Octocat',
          bio: 'GitHub mascot',
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          html_url: 'https://github.com/octocat',
          company: null,
          blog: null,
          location: 'San Francisco',
          public_repos: 8,
          public_gists: 1,
          followers: 100,
          following: 0,
          created_at: '2011-01-25T18:44:36Z',
          updated_at: '2024-01-01T00:00:00Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const service = new ProfileService();
    const profile = await service.getProfile('octocat');

    expect(profile).toMatchObject({
      username: 'octocat',
      followers: 100,
      publicRepos: 8,
      profileUrl: 'https://github.com/octocat',
      achievementsCount: 2,
    });
    expect(profile.readme?.exists).toBe(true);
    expect(profile.contributions[0]?.total).toBeGreaterThanOrEqual(3);
    expect(profile.achievements[0]?.imageUrl).toContain('githubassets.com');
  });
});
