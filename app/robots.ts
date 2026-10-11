import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://carrygo-chi.vercel.app').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
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
