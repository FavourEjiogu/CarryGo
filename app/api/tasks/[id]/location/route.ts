import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

const active=['IN_PROGRESS','AT_VENDOR','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING'];

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:task}=await s.from('errands').select('id,payer_id,runner_id,status').eq('id',id).maybeSingle();
  if(!task||task.payer_id!==user.id&&task.runner_id!==user.id)return NextResponse.json({error:'Not authorized'},{status:403});
  if(!active.includes(task.status))return NextResponse.json({session:null});
  const {data:session,error}=await s.from('delivery_sessions').select('id,errand_id,status,started_at,ended_at,last_runner_lat,last_runner_lng,last_runner_accuracy_m,last_runner_at,last_payer_lat,last_payer_lng,last_payer_accuracy_m,last_payer_at,tracking_mode').eq('errand_id',id).maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({session:session||null,viewer_id:user.id});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const b=await request.json().catch(()=>({}));
  const latitude=Number(b.latitude),longitude=Number(b.longitude),accuracy=Number(b.accuracy_m);
  const sequence=Number(b.sequence);
  const captured=b.captured_at?new Date(b.captured_at):new Date();
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||!Number.isFinite(sequence)||Number.isNaN(captured.getTime()))return NextResponse.json({error:'Invalid location payload.'},{status:400});
  const {data,error}=await s.rpc('record_delivery_location',{p_errand_id:id,p_latitude:latitude,p_longitude:longitude,p_accuracy_m:Number.isFinite(accuracy)?accuracy:0,p_captured_at:captured.toISOString(),p_client_sequence:Math.max(1,Math.floor(sequence))});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}
