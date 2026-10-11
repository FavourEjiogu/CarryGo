import type { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/src/lib/site-origin';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteOrigin();

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/faq', '/privacy', '/terms', '/campus', '/testimonials'],
      disallow: [
        '/api/',
        '/orders',
        '/wallet',
        '/profile',
        '/you',
        '/security',
        '/refer',
        '/notifications',
        '/onboarding',
        '/mfa',
        '/reset-password',
        '/status/share/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
