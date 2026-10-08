import{NextResponse}from'next/server';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;
 const s=await createSupabaseServerClient();
 const{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const{data:allowed,error:rateError}=await s.rpc('consume_rate_limit',{p_scope:'repeat-task',p_limit:5,p_window_seconds:600});
 if(rateError)return NextResponse.json({error:'Could not verify request limits. Try again.'},{status:503});
 if(!allowed)return NextResponse.json({error:'Too many repeat requests. Try again shortly.'},{status:429});
 const{data:newId,error}=await s.rpc('repeat_errand',{p_errand_id:id});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({task:{id:newId}},{status:201});
}
