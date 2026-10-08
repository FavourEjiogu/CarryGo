import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { getSiteOrigin } from '@/src/lib/site-origin';

function safeNext(value:string|null){
  if(!value||!value.startsWith('/')||value.startsWith('//')) return '/';
  return value;
}

export async function GET(request:Request){
  const url=new URL(request.url);
  const origin=getSiteOrigin(url.origin);
  const tokenHash=url.searchParams.get('token_hash');
  const type=url.searchParams.get('type') as EmailOtpType|null;
  const next=safeNext(url.searchParams.get('next'));
  if(!tokenHash||!type) return NextResponse.redirect(new URL('/login?error=missing_code',origin));
  const supabase=await createSupabaseServerClient();
  const{error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type});
  if(error) return NextResponse.redirect(new URL('/login?error=auth_failed',origin));
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.redirect(new URL('/login?error=auth_failed',origin));
  const{data:profile}=await supabase.from('users').select('display_name,phone_number,campus_id').eq('id',user.id).maybeSingle();
  if(!profile?.display_name||!profile?.phone_number||!profile?.campus_id) return NextResponse.redirect(new URL('/onboarding',origin));
  const{data:aal}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal?.nextLevel==='aal2'&&aal?.currentLevel!=='aal2') return NextResponse.redirect(new URL('/mfa?next='+encodeURIComponent(next),origin));
  return NextResponse.redirect(new URL(next,origin));
}
