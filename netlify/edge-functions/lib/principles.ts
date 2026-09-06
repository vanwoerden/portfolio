// Keep in sync with on/principles/principles.json

export interface PrincipleEntry {
  slug: string;
  title: string;
  published: boolean;
}

export const PRINCIPLES: PrincipleEntry[] = [
  {
    slug: "design",
    title: "Design is the manifestation of ideas",
    published: false,
  },
  {
    slug: "focus",
    title: "A great team requires focus",
    published: false,
  },
  {
    slug: "slack-variety-cadence",
    title: "A great team craves slack, variety, and cadence",
    published: false,
  },
  {
    slug: "seeing-it-through-together",
    title: "Teamwork means seeing it through together",
    published: false,
  },
  {
    slug: "starting-out-informed",
    title: "It means starting out informed",
    published: false,
  },
  {
    slug: "time-vs-scope",
    title: "Being flexible about time and scope",
    published: false,
  },
  {
    slug: "quality",
    title: "Keeping quality constant",
    published: false,
  },
  {
    slug: "before-and-after",
    title: "And thinking about the before and after",
    published: false,
  },
  {
    slug: "designers-should-code",
    title: "Designers should code",
    published: true,
  },
];

export function unpublishedPrincipleSlugs(): string[] {
  return PRINCIPLES.filter((p) => !p.published).map((p) => p.slug);
}

/** True when the path is an unpublished principle page (or a nested asset under it). */
export function isUnpublishedPrinciplePath(pathname: string): boolean {
  const match = pathname.match(/^\/on\/principles\/([^/]+)(?:\/|$)/);
  if (!match) return false;
  const slug = match[1];
  const entry = PRINCIPLES.find((p) => p.slug === slug);
  return Boolean(entry && !entry.published);
}
