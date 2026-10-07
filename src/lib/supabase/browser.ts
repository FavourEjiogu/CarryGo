import { createBrowserClient } from '@supabase/ssr';

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 400;

export function getSupabaseBrowserClient(rememberMe = true) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase browser configuration is missing.');
  return createBrowserClient(url, key, {
    cookieOptions: { maxAge: rememberMe ? REMEMBER_MAX_AGE : undefined },
  });
}
