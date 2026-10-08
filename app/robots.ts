import type { MetadataRoute } from 'next';

const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://carrygo-chi.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: ['/', '/faq', '/privacy', '/terms', '/campus'] },
    sitemap: publicOrigin + '/sitemap.xml',
  };
}
