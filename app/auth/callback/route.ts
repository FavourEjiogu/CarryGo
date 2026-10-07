import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const canonical = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : url;
  const code = url.searchParams.get('code');
  const flow = url.searchParams.get('flow') === 'signup' ? 'signup' : 'signin';
  const rememberMe = url.searchParams.get('remember') === '1';
  if (!code) return NextResponse.redirect(new URL('/login?error=missing_code', canonical.origin));

  const supabase = await createSupabaseServerClient({ rememberMe });
  const result = await supabase.auth.exchangeCodeForSession(code);
  if (result.error) return NextResponse.redirect(new URL('/login?error=auth_failed', canonical.origin));

  const store = await cookies();
  store.set('cg_remember', rememberMe ? '1' : '0', {
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 400 : undefined,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
  const { data: profile } = await supabase.from('users').select('display_name,phone_number').eq('id', user.id).maybeSingle();
  const needsOnboarding = !profile?.phone_number || flow === 'signup';
  return NextResponse.redirect(new URL(needsOnboarding ? '/onboarding' : '/', canonical.origin));
}
