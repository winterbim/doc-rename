import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rename.bimcheck-consulting.com';

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pilot', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/iso-19650', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/security', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/conditions', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/mentions-legales', changeFrequency: 'yearly', priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date('2026-07-21'),
    changeFrequency,
    priority,
  }));
}
