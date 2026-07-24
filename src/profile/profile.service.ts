import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GitHubAchievement,
  GitHubContributionYear,
  GitHubProfile,
  GitHubUserApiResponse,
} from './profile.types';
import {
  fetchGitHubAchievementsPage,
  fetchGitHubContributionsPage,
  fetchGitHubReadme,
  fetchGitHubUser,
} from './github.client';
import { parseAchievements, parseContributionYear } from './github.parsers';

@Injectable()
export class ProfileService {
  private readonly profileCache = new Map<string, { expiresAt: number; value: GitHubProfile }>();
  private readonly pendingProfiles = new Map<string, Promise<GitHubProfile>>();
  private readonly cacheTtlMs = 5 * 60 * 1000;

  async getProfile(username: string): Promise<GitHubProfile> {
    const sanitizedUsername = username.trim();
    const cacheKey = sanitizedUsername.toLowerCase();

    if (!sanitizedUsername) {
      throw new NotFoundException('GitHub username is required');
    }

    const cached = this.profileCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const pending = this.pendingProfiles.get(cacheKey);
    if (pending) {
      return pending;
    }

    const profilePromise = this.buildProfile(sanitizedUsername).then((profile) => {
      this.profileCache.set(cacheKey, {
        value: profile,
        expiresAt: Date.now() + this.cacheTtlMs,
      });
      this.pendingProfiles.delete(cacheKey);
      return profile;
    }).catch((error) => {
      this.pendingProfiles.delete(cacheKey);
      throw error;
    });

    this.pendingProfiles.set(cacheKey, profilePromise);
    return profilePromise;
  }

  private async buildProfile(sanitizedUsername: string): Promise<GitHubProfile> {
    const response = await fetchGitHubUser(sanitizedUsername);

    if (response.status === 404) {
      throw new NotFoundException(`GitHub user "${sanitizedUsername}" was not found`);
    }

    if (response.status === 403 || response.status === 429) {
      throw new HttpException('GitHub rate limit reached. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    if (!response.ok) {
      throw new BadGatewayException('GitHub API returned an unexpected response');
    }

    const data = (await response.json()) as GitHubUserApiResponse;
    const [readme, contributions, achievements] = await Promise.all([
      fetchGitHubReadme(sanitizedUsername),
      this.fetchContributionYears(sanitizedUsername),
      this.fetchAchievementsCount(sanitizedUsername),
    ]);

    return {
      username: data.login,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      profileUrl: data.html_url,
      company: data.company,
      blog: data.blog,
      location: data.location,
      publicRepos: data.public_repos,
      publicGists: data.public_gists,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      readme,
      contributions,
      achievements,
      achievementsCount: achievements.length,
    };
  }

  private async fetchContributionYears(username: string): Promise<GitHubContributionYear[]> {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    const contributions = await Promise.all(
      years.map((year) =>
        fetchGitHubContributionsPage(username, year).then(async (response) => {
          if (response.status === 404) {
            return null;
          }

          if (!response.ok) {
            throw new BadGatewayException(`Unable to load contribution data for ${year}`);
          }

          return parseContributionYear(await response.text(), year);
        }),
      ),
    );
    return contributions.filter((year): year is GitHubContributionYear => Boolean(year));
  }

  private async fetchAchievementsCount(username: string): Promise<GitHubAchievement[]> {
    const response = await fetchGitHubAchievementsPage(username);

    if (!response.ok) {
      return [];
    }

    return parseAchievements(await response.text());
  }
}
