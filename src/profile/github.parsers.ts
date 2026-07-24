import { BadGatewayException } from '@nestjs/common';
import { GitHubAchievement, GitHubContributionDay, GitHubContributionYear } from './profile.types';

const monthIndexByName: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export function parseContributionYear(html: string, year: number): GitHubContributionYear | null {
  const days = parseContributionDays(html, year);

  if (!days.length) {
    return null;
  }

  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in(?:\s+the\s+last\s+year|\s+\d{4})/i);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : days.reduce((sum, day) => sum + day.count, 0);

  return {
    year,
    total,
    days,
  };
}

function parseContributionDays(html: string, year: number): GitHubContributionDay[] {
  const matches = Array.from(
    html.matchAll(/(?:No|([\d,]+)) contributions? on ([A-Za-z]+) (\d{1,2})(?:st|nd|rd|th)\./gi),
  );

  return matches.map((match) => {
    const monthIndex = monthIndexByName[match[2].toLowerCase()];

    if (monthIndex === undefined) {
      throw new BadGatewayException(`Unable to parse contribution month: ${match[2]}`);
    }

    const dayOfMonth = Number(match[3]);
    const count = match[1] ? Number(match[1].replace(/,/g, '')) : 0;

    return {
      date: new Date(Date.UTC(year, monthIndex, dayOfMonth)).toISOString().slice(0, 10),
      count,
    };
  });
}

export function parseAchievements(html: string): GitHubAchievement[] {
  const achievementCards = Array.from(
    html.matchAll(/<details[^>]*data-achievement-slug="([^"]+)"[^>]*>([\s\S]*?)<\/details>/gi),
  );

  const achievements = achievementCards.length
    ? achievementCards
        .map((match) => {
          const slug = match[1].trim();
          const block = match[2];
          const imageUrl = block.match(/<img[^>]*src="([^"]+)"/i)?.[1]?.trim() ?? null;
          const alt = block.match(/<img[^>]*alt="([^"]*)"/i)?.[1]?.trim() ?? null;

          return { slug, imageUrl, alt };
        })
        .filter((item): item is { slug: string; imageUrl: string | null; alt: string | null } => Boolean(item.slug))
    : Array.from(html.matchAll(/<img[^>]*class="[^"]*achievement-badge-card[^"]*"[^>]*>/gi))
        .map((match) => match[0])
        .map((tag) => {
          const slug = tag.match(/data-achievement-slug="([^"]+)"/i)?.[1]?.trim() ?? null;
          const imageUrl = tag.match(/src="([^"]+)"/i)?.[1]?.trim() ?? null;
          const alt = tag.match(/alt="([^"]*)"/i)?.[1]?.trim() ?? null;

          return {
            slug,
            imageUrl,
            alt,
          };
        })
        .filter((item): item is { slug: string; imageUrl: string | null; alt: string | null } => Boolean(item.slug));

  const uniqueBadges = Array.from(new Map(achievements.map((item) => [item.slug, item])).values());

  return uniqueBadges.map(({ slug, imageUrl, alt }) => ({
    label: slug
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    description: alt?.replace(/^Achievement:\s*/i, '') ?? 'Logro público detectado en el perfil de GitHub.',
    imageUrl,
  }));
}
