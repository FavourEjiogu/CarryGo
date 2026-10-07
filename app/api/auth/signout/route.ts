import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function POST(){
  const s=await createSupabaseServerClient();
  await s.auth.signOut();
  const store=await cookies();
  store.set('cg_remember','0',{path:'/',maxAge:0,httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'});
  return NextResponse.json({ok:true});
}
