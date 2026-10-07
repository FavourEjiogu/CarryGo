import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

const allowed=new Set(['IN_PROGRESS','AT_VENDOR','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING']);

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const b=await request.json().catch(()=>({}));
  const next=String(b.next_status||'');
  if(!allowed.has(next))return NextResponse.json({error:'Unsupported status change.'},{status:400});
  const {data,error}=await s.rpc('advance_errand',{p_errand_id:id,p_actor_id:user.id,p_next_status:next});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}
