export const DEFAULT_SITE_ORIGIN = 'https://carrygo-chi.vercel.app';

export function getSiteOrigin(requestOrigin?: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const production = process.env.NODE_ENV === 'production';

  if (configured) {
    try {
      const parsed = new URL(configured);
      if (!production || parsed.protocol === 'https:') return parsed.origin;
    } catch {
      // Fall through to the safe environment-aware fallback.
    }
  }

  if (production) return DEFAULT_SITE_ORIGIN;

  if (requestOrigin) {
    try {
      return new URL(requestOrigin).origin;
    } catch {
      // Fall through to the browser origin below.
    }
  }

  if (typeof window !== 'undefined') return window.location.origin.replace(/\\/$/, '');
  return DEFAULT_SITE_ORIGIN;
}
