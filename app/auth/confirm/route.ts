import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

function safeNext(value:string|null){
  if(!value||!value.startsWith('/')||value.startsWith('//')) return '/';
  return value;
}

export async function GET(request:Request){
  const url=new URL(request.url);
  const tokenHash=url.searchParams.get('token_hash');
  const type=url.searchParams.get('type') as EmailOtpType|null;
  const next=safeNext(url.searchParams.get('next'));
  if(!tokenHash||!type) return NextResponse.redirect(new URL('/login?error=missing_code',url.origin));
  const supabase=await createSupabaseServerClient();
  const{error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type});
  if(error) return NextResponse.redirect(new URL('/login?error=auth_failed',url.origin));
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.redirect(new URL('/login?error=auth_failed',url.origin));
  const{data:profile}=await supabase.from('users').select('display_name,phone_number,campus_id').eq('id',user.id).maybeSingle();
  const needsOnboarding=!profile?.display_name||!profile?.phone_number||!profile?.campus_id;
  return NextResponse.redirect(new URL(needsOnboarding?'/onboarding':next,url.origin));
}
