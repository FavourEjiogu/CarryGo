import{NextResponse}from'next/server';import{createSupabaseServerClient}from'@/src/lib/supabase/server';
function overnight(){const h=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).find(x=>x.type==='hour')?.value||0);return h>=22||h<5}
export async function GET(){
 const s=await createSupabaseServerClient();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({authenticated:false},{status:401});
 const{data:profile,error:profileError}=await s.from('users').select('display_name,verification_level,campus_id').eq('id',user.id).single();
 if(profileError||!profile)return NextResponse.json({error:'Account profile unavailable'},{status:409});
 const campus=profile.campus_id?(await s.from('campuses').select('name,city,state').eq('id',profile.campus_id).maybeSingle()).data:null;
 const market=s.from('errands').select('id',{count:'exact',head:true}).in('status',['OPEN','NEGOTIATING']).eq('campus_id',profile.campus_id||'00000000-0000-0000-0000-000000000000');
 const[st,ts,oc]=await Promise.all([
  s.from('user_streaks').select('current_weeks,best_weeks,discount_percent,rescue_tokens,sponsored_task_unlocked').eq('user_id',user.id).maybeSingle(),
  s.from('errands').select('id,title,status,delivery_mode,pickup_location_text,destination_location_text,proposed_runner_fee_kobo,scheduled_for,created_at').or('payer_id.eq.'+user.id+',runner_id.eq.'+user.id).not('status','in','(COMPLETED,CANCELLED,EXPIRED,FAILED)').order('created_at',{ascending:false}).limit(3),
  overnight()?market.in('delivery_mode',['HOSTEL','ROOM']):market
 ]);
 return NextResponse.json({authenticated:true,profile,campus,streak:st.data,tasks:ts.data||[],openTaskCount:oc.count||0,overnight_hostel_only:overnight(),needs_onboarding:!profile.campus_id||!profile.display_name})
}