export interface GitHubUserApiResponse {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
}

export interface GitHubContributionYear {
  year: number;
  total: number;
  days: GitHubContributionDay[];
}

export interface GitHubReadme {
  exists: boolean;
  htmlUrl: string | null;
  content: string | null;
}

export interface GitHubAchievement {
  label: string;
  description: string;
  imageUrl: string | null;
}

export interface GitHubProfile {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
  readme: GitHubReadme | null;
  contributions: GitHubContributionYear[];
  achievements: GitHubAchievement[];
  achievementsCount: number;
}
