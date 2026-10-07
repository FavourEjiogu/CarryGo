import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET(){
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {error:syncError}=await s.rpc('sync_streak_benefits',{p_user_id:user.id});
  if(syncError)return NextResponse.json({error:syncError.message},{status:400});
  const [st,credit,boosts,challenges]=await Promise.all([
    s.from('user_streaks').select('current_weeks,best_weeks,discount_percent,rescue_tokens,sponsored_task_unlocked').eq('user_id',user.id).single(),
    s.from('user_credits').select('balance_kobo').eq('user_id',user.id).maybeSingle(),
    s.from('streak_boosts').select('id,name,description,discount_percent_delta,start_at,end_at').eq('active',true).limit(8),
    s.from('streak_challenges').select('id,name,description,week_start,week_end').eq('active',true).limit(8),
  ]);
  return NextResponse.json({streak:st.data||null,credit_kobo:Number(credit.data?.balance_kobo||0),boosts:boosts.data||[],challenges:challenges.data||[]});
}
