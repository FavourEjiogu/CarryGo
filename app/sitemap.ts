import type { MetadataRoute } from 'next';

const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://carrygo-chi.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/faq', '/privacy', '/terms'];
  const now = new Date();
  return paths.map((path) => ({
    url: publicOrigin + path,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.5,
  }));
}
