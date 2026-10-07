import{NextResponse}from'next/server';import{createSupabaseServerClient}from'@/src/lib/supabase/server';
function hourLagos(){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return Number(parts.find(x=>x.type==='hour')?.value||0)}
function fullMarketplaceOpen(){const h=hourLagos();return h>=5&&h<22}
function overnight(){return !fullMarketplaceOpen()}
export async function GET(request:Request){
 const s=await createSupabaseServerClient();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const u=new URL(request.url),mine=u.searchParams.get('mine')==='1';
 let q=s.from('errands').select('id,title,description,category,estimated_item_cost_kobo,proposed_runner_fee_kobo,proposed_eta_minutes,payer_deadline_at,runner_preference,delivery_mode,delivery_room,scheduled_for,same_gender_premium_kobo,status,created_at,pickup_location_text,destination_location_text,payer_id,runner_id,service_fee_kobo,service_fee_discount_kobo').order('created_at',{ascending:false}).limit(50);
 if(mine) q=q.or('payer_id.eq.'+user.id+',runner_id.eq.'+user.id); else {q=q.in('status',['OPEN','NEGOTIATING']);if(overnight())q=q.in('delivery_mode',['HOSTEL','ROOM'])}
 const{data,error}=await q;if(error)return NextResponse.json({error:'Could not load tasks.'},{status:400});
 const tasks=(data||[]).map(task=>!mine&&task.delivery_mode==='ROOM'?{...task,delivery_room:null}:task);
 return NextResponse.json({tasks,open:true,full_marketplace:fullMarketplaceOpen(),overnight_hostel_only:overnight()})
}
export async function POST(request:Request){
 const s=await createSupabaseServerClient();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const{data:allowed,error:rateError}=await s.rpc('consume_rate_limit',{p_scope:'create-task',p_limit:10,p_window_seconds:600});if(rateError)return NextResponse.json({error:'Could not verify request limits. Try again.'},{status:503});if(!allowed)return new NextResponse(JSON.stringify({error:'You have posted a lot of tasks recently. Try again in a few minutes.'}),{status:429,headers:{'content-type':'application/json','retry-after':'60'}});
 const b=await request.json().catch(()=>({})),title=String(b.title||'').trim().slice(0,160),description=String(b.description||'').trim().slice(0,2000),pickup=String(b.pickup_location_text||'').trim().slice(0,250),destination=String(b.destination_location_text||'').trim().slice(0,250),item=Math.max(0,Math.round(Number(b.estimated_item_cost_kobo||0))),fee=Math.max(0,Math.round(Number(b.proposed_runner_fee_kobo||0))),eta=Math.max(10,Math.min(240,Math.round(Number(b.proposed_eta_minutes||30)))),mode=b.delivery_mode==='ROOM'?'ROOM':b.delivery_mode==='HOSTEL'?'HOSTEL':'LANDMARK',room=mode==='ROOM'?String(b.delivery_room||'').trim().slice(0,80):null,when=b.scheduled_for?new Date(b.scheduled_for):null;
 if(!title||!description||!pickup||!destination||fee<=0)return NextResponse.json({error:'Complete the task details.'},{status:400});
 if(when&&Number.isNaN(when.getTime()))return NextResponse.json({error:'Choose a valid delivery time.'},{status:400});
 if(overnight()&&mode==='LANDMARK')return NextResponse.json({error:'From 10 PM to 5 AM, only hostel or room delivery is available.'},{status:409});
 const{data:id,error}=await s.rpc('create_errand',{p_title:title,p_description:description,p_pickup:pickup,p_destination:destination,p_item_cost_kobo:item,p_runner_fee_kobo:fee,p_eta_minutes:eta,p_delivery_mode:mode,p_delivery_room:room,p_scheduled_for:when?.toISOString()??null});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({task:{id,title,status:'OPEN',delivery_mode:mode,delivery_room:room}},{status:201})
}