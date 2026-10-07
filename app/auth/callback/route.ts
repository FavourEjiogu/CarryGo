import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

function canonicalOrigin(req: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return new URL(req.url).origin;
  const parsed = new URL(configured);
  if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS in production');
  return parsed.origin;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  let origin: string;
  try { origin = canonicalOrigin(req); } catch { return NextResponse.redirect(new URL('/login?error=auth_config', url.origin)); }
  const code = url.searchParams.get('code');
  const flow = url.searchParams.get('flow') === 'signup' ? 'signup' : 'signin';
  const rememberMe = url.searchParams.get('remember') === '1';
  if (!code) return NextResponse.redirect(new URL('/login?error=missing_code', origin));

  const supabase = await createSupabaseServerClient({ rememberMe });
  const result = await supabase.auth.exchangeCodeForSession(code);
  if (result.error) return NextResponse.redirect(new URL('/login?error=auth_failed', origin));

  const store = await cookies();
  store.set('cg_remember', rememberMe ? '1' : '0', {
    path:'/', maxAge:rememberMe ? 60*60*24*400 : undefined,
    httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production',
  });

  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.redirect(new URL('/login?error=auth_failed',origin));
  const{data:profile}=await supabase.from('users').select('display_name,phone_number,campus_id').eq('id',user.id).maybeSingle();
  const needsOnboarding=!profile?.phone_number||!profile?.campus_id||flow==='signup';
  return NextResponse.redirect(new URL(needsOnboarding?'/onboarding':'/',origin));
}