import { BadGatewayException } from '@nestjs/common';
import { GitHubReadme } from './profile.types';

const userAgent = 'PIEROLS15';

async function fetchGitHubApi(url: string): Promise<Response> {
  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': userAgent,
      },
    });
  } catch {
    throw new BadGatewayException('Unable to reach GitHub API');
  }
}

export async function fetchGitHubUser(username: string): Promise<Response> {
  try {
    return await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': userAgent,
      },
    });
  } catch {
    throw new BadGatewayException('Unable to reach GitHub API');
  }
}

export async function fetchGitHubReadme(username: string): Promise<GitHubReadme | null> {
  const response = await fetchGitHubApi(
    `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/readme`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new BadGatewayException('Unable to load profile README');
  }

  const data = (await response.json()) as { content: string; html_url: string };
  const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');

  return {
    exists: true,
    htmlUrl: data.html_url,
    content,
  };
}

export async function fetchGitHubContributionsPage(username: string, year: number): Promise<Response> {
  try {
    return await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions?from=${year}-01-01&to=${year}-12-31`,
      {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': userAgent,
        },
      },
    );
  } catch {
    throw new BadGatewayException('Unable to reach GitHub');
  }
}

export async function fetchGitHubAchievementsPage(username: string): Promise<Response> {
  try {
    return await fetch(`https://github.com/${encodeURIComponent(username)}?tab=achievements`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': userAgent,
      },
    });
  } catch {
    throw new BadGatewayException('Unable to reach GitHub');
  }
}
