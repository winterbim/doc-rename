import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rename.bimcheck-consulting.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // HTML utility pages expose a noindex directive in their own metadata.
      // Blocking them here would prevent crawlers from seeing that directive.
      disallow: ['/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
