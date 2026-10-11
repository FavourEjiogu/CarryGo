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
  if(!active.includes(task.status))return NextResponse.json({session:null},{headers:{'cache-control':'private, no-store'}});
  const {data:session,error}=await s.from('delivery_sessions').select('id,errand_id,status,started_at,ended_at,last_runner_lat,last_runner_lng,last_runner_accuracy_m,last_runner_at,last_payer_lat,last_payer_lng,last_payer_accuracy_m,last_payer_at,tracking_mode').eq('errand_id',id).maybeSingle();
  if(error)return NextResponse.json({error:'Could not load delivery location.'},{status:400,headers:{'cache-control':'private, no-store'}});
  return NextResponse.json({session:session||null,viewer_id:user.id},{headers:{'cache-control':'private, no-store'}});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const b=await request.json().catch(()=>null);
  if(!b||typeof b!=='object')return NextResponse.json({error:'Invalid location payload.'},{status:400});
  const latitude=Number(b.latitude),longitude=Number(b.longitude),accuracy=Number(b.accuracy_m),sequence=Number(b.sequence);
  const captured=b.captured_at?new Date(b.captured_at):null;
  if(
    !Number.isFinite(latitude)||latitude < -90||latitude > 90||
    !Number.isFinite(longitude)||longitude < -180||longitude > 180||
    !Number.isFinite(accuracy)||accuracy < 0||accuracy > 100000||
    !Number.isSafeInteger(sequence)||sequence < 1||
    !captured||Number.isNaN(captured.getTime())
  )return NextResponse.json({error:'Invalid location payload.'},{status:400,headers:{'cache-control':'no-store'}});
  const age=Date.now()-captured.getTime();
  if(age < -30000||age > 2*60*1000)return NextResponse.json({error:'This location update is too old or has an invalid timestamp. A fresh GPS update is needed.'},{status:400,headers:{'cache-control':'no-store'}});
  const {data,error}=await s.rpc('record_delivery_location',{p_errand_id:id,p_latitude:latitude,p_longitude:longitude,p_accuracy_m:accuracy,p_captured_at:captured.toISOString(),p_client_sequence:sequence});
  if(error)return NextResponse.json({error:'Could not accept this location update.'},{status:400,headers:{'cache-control':'no-store'}});
  return NextResponse.json(data,{headers:{'cache-control':'private, no-store'}});
}
