import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 400;

export async function createSupabaseServerClient(options: { rememberMe?: boolean } = {}) {
  const cookieStore = await cookies();
  const rememberCookie = cookieStore.get('cg_remember')?.value === '1';
  const rememberMe = options.rememberMe ?? rememberCookie;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: { maxAge: rememberMe ? REMEMBER_MAX_AGE : undefined },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(values) {
          try { values.forEach(({ name, value, options: cookieOptions }) => cookieStore.set(name, value, cookieOptions)); } catch {}
        },
      },
    },
  );
}
