import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401},{headers:{'cache-control':'no-store'}});
  const {data:task,error}=await s.from('errands').select('id,campus_id,payer_id,runner_id,title,description,category,estimated_item_cost_kobo,proposed_runner_fee_kobo,proposed_eta_minutes,hard_max_total_kobo,status,runner_preference,delivery_mode,delivery_room,scheduled_for,same_gender_premium_kobo,service_fee_kobo,service_fee_discount_kobo,discount_percent_used,pickup_location_text,destination_location_text,started_at,vendor_arrived_at,handoff_started_at,completed_at,created_at,updated_at').eq('id',id).maybeSingle();
  if(error)return NextResponse.json({error:'Could not load task.'},{status:400});
  if(!task)return NextResponse.json({error:'Task not found.'},{status:404});
  const participant=task.payer_id===user.id||task.runner_id===user.id;
  if(!participant&&!['OPEN','NEGOTIATING'].includes(task.status))return NextResponse.json({error:'Not authorized.'},{status:403});

  const runnerPromise=task.runner_id?s.from('user_public_profiles').select('user_id,username,display_name,verification_level,avatar_object_path').eq('user_id',task.runner_id).maybeSingle():Promise.resolve({data:null});
  const bidsPromise=participant?s.from('errand_bids').select('id,errand_id,runner_id,fee_kobo,eta_minutes,runner_float_capacity_kobo,message,status,expires_at,created_at').eq('errand_id',id).order('created_at',{ascending:false}).limit(50):Promise.resolve({data:[],error:null});
  const agreementPromise=participant?s.from('errand_agreements').select('id,item_budget_kobo,runner_fee_kobo,agreed_eta_minutes,grace_minutes,hard_max_total_kobo,runner_deadline_at,payer_handoff_deadline_at,proof_policy,accepted_at').eq('errand_id',id).maybeSingle():Promise.resolve({data:null});
  const messagesPromise=participant?s.from('errand_messages').select('id,sender_id,body,created_at').eq('errand_id',id).order('created_at',{ascending:true}).limit(80):Promise.resolve({data:[]});
  const adjustmentsPromise=participant?s.from('price_adjustments').select('id,errand_id,requested_by,previous_item_cost_kobo,new_item_cost_kobo,variance_kobo,reason,evidence_object_path,status,approved_by,approved_at,created_at').eq('errand_id',id).order('created_at',{ascending:false}).limit(5):Promise.resolve({data:[]});
  const locationPromise=participant&&['IN_PROGRESS','AT_VENDOR','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING'].includes(task.status)?s.from('delivery_sessions').select('id,errand_id,status,started_at,ended_at,last_runner_lat,last_runner_lng,last_runner_accuracy_m,last_runner_at,last_payer_lat,last_payer_lng,last_payer_accuracy_m,last_payer_at,tracking_mode').eq('errand_id',id).maybeSingle():Promise.resolve({data:null});
  const handoffPromise=participant?s.rpc('get_handoff',{p_errand_id:id}):Promise.resolve({data:{handoff:null}});
  const [runner, bids, agreement, messages, adjustments, location, handoff]=await Promise.all([runnerPromise,bidsPromise,agreementPromise,messagesPromise,adjustmentsPromise,locationPromise,handoffPromise]);

  let bidRows=bids.data||[];
  if(bidRows.length){
    const ids=bidRows.map(x=>x.runner_id);
    const {data:profiles}=await s.from('user_public_profiles').select('user_id,username,display_name,verification_level').in('user_id',ids);
    const map=new Map((profiles||[]).map(x=>[x.user_id,x]));
    bidRows=bidRows.map(b=>({...b,runner:map.get(b.runner_id)||null}));
  }

  return NextResponse.json({
    task,agreement:agreement.data||null,runner:runner.data||null,bids:bidRows,
    messages:messages.data||[],adjustments:adjustments.data||[],tracking:{session:location.data||null},
    handoff:handoff.data?.handoff||null,viewer_id:user.id
  },{headers:{'cache-control':'private, no-store'}});
}