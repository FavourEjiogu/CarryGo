import{createHash,randomBytes}from'node:crypto';
import{NextResponse}from'next/server';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;
 const s=await createSupabaseServerClient();
 const{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});

 const{data:allowed,error:rateError}=await s.rpc('consume_rate_limit',{p_scope:'share-status',p_limit:5,p_window_seconds:600});
 if(rateError)return NextResponse.json({error:'Could not verify request limits. Try again.'},{status:503});
 if(!allowed)return NextResponse.json({error:'Too many share links. Try again shortly.'},{status:429});

 const token=randomBytes(24).toString('base64url');
 const tokenHash=createHash('sha256').update(token).digest('hex');
 const expires=new Date(Date.now()+2*60*60*1000).toISOString();

 const{data,error}=await s.rpc('create_shared_task_status',{p_errand_id:id,p_token_hash:tokenHash,p_expires_at:expires});
 if(error)return NextResponse.json({error:error.message},{status:400});

 return NextResponse.json({url:'/status/share/'+token,expires_at:data?.[0]?.expires_at||expires},{headers:{'Cache-Control':'no-store'}});
}
