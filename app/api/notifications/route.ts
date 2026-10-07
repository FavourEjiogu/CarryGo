import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET() {
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data,error}=await s.from('notifications').select('id,kind,title,body,data,read_at,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(60);
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({notifications:data||[]});
}

export async function PATCH(request:Request) {
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const b=await request.json().catch(()=>({}));
  let q=s.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',user.id).is('read_at',null);
  if(b.id) q=q.eq('id',String(b.id));
  const {error}=await q;
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
