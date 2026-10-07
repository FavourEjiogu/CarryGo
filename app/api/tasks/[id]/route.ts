import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:task,error}=await s.from('errands').select('id,campus_id,payer_id,runner_id,title,description,category,estimated_item_cost_kobo,proposed_runner_fee_kobo,proposed_eta_minutes,hard_max_total_kobo,status,runner_preference,delivery_mode,delivery_room,scheduled_for,same_gender_premium_kobo,service_fee_kobo,service_fee_discount_kobo,discount_percent_used,pickup_location_text,destination_location_text,started_at,vendor_arrived_at,handoff_started_at,completed_at,created_at,updated_at').eq('id',id).maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:400});
  if(!task)return NextResponse.json({error:'Task not found'},{status:404});
  if(task.payer_id!==user.id&&task.runner_id!==user.id&&!['OPEN','NEGOTIATING'].includes(task.status))return NextResponse.json({error:'Not authorized'},{status:403});
  let runner=null;
  if(task.runner_id){
    const {data:p}=await s.from('user_public_profiles').select('user_id,username,display_name,verification_level,avatar_object_path').eq('user_id',task.runner_id).maybeSingle();
    runner=p||null;
  }
  const {data:agreement}=await s.from('errand_agreements').select('id,item_budget_kobo,runner_fee_kobo,agreed_eta_minutes,grace_minutes,hard_max_total_kobo,runner_deadline_at,payer_handoff_deadline_at,proof_policy,accepted_at').eq('errand_id',id).maybeSingle();
  return NextResponse.json({task,agreement:agreement||null,runner,viewer_id:user.id});
}
