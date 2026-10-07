import{createHash,randomBytes}from'node:crypto';
import{NextResponse}from'next/server';
import{createSupabaseAdminClient}from'@/src/lib/supabase/admin';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;
 const s=await createSupabaseServerClient();
 const{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});

 const{data:allowed,error:rateError}=await s.rpc('consume_rate_limit',{p_scope:'share-status',p_limit:5,p_window_seconds:600});
 if(rateError)return NextResponse.json({error:'Could not verify request limits. Try again.'},{status:503});
 if(!allowed)return NextResponse.json({error:'Too many share links. Try again shortly.'},{status:429});

 const{data:task,error}=await s.from('errands').select('id,payer_id,runner_id,status').eq('id',id).maybeSingle();
 if(error)return NextResponse.json({error:'Could not load task.'},{status:400});
 if(!task||![task.payer_id,task.runner_id].includes(user.id))return NextResponse.json({error:'Not authorized.'},{status:403});
 if(['COMPLETED','CANCELLED','EXPIRED','FAILED','DISPUTED','ABANDONED'].includes(task.status))return NextResponse.json({error:'This task no longer needs a live status link.'},{status:409});

 const token=randomBytes(24).toString('base64url');
 const tokenHash=createHash('sha256').update(token).digest('hex');
 const admin=createSupabaseAdminClient();
 await admin.from('shared_task_status').update({revoked_at:new Date().toISOString()}).eq('errand_id',id).eq('created_by',user.id).is('revoked_at',null);
 const expires=new Date(Date.now()+2*60*60*1000);
 const{error:insertError}=await admin.from('shared_task_status').insert({errand_id:id,created_by:user.id,token_hash:tokenHash,expires_at:expires.toISOString()});
 if(insertError)return NextResponse.json({error:'Could not create a share link.'},{status:500});

 return NextResponse.json({url:'/status/share/'+token,expires_at:expires.toISOString()},{headers:{'Cache-Control':'no-store'}});
}
