import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function POST(){
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data,error}=await s.rpc('use_streak_rescue',{p_user_id:user.id});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({streak:data});
}
