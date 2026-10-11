import type { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/src/lib/site-origin';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteOrigin();
  const now = new Date();
  const publicPaths = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/campus', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/testimonials', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  return publicPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
