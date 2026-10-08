import{createHash}from'node:crypto';
import{NextResponse}from'next/server';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';

export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){
 const{token}=await params;
 if(!token||token.length<20||token.length>128)return NextResponse.json({error:'Status link not found.'},{status:404,headers:{'Cache-Control':'no-store'}});
 const hash=createHash('sha256').update(token).digest('hex');
 const s=await createSupabaseServerClient();
 const{data,error}=await s.rpc('get_shared_task_status',{p_token_hash:hash});
 const task=Array.isArray(data)?data[0]:null;
 if(error||!task)return NextResponse.json({error:'This status link has expired or is unavailable.'},{status:410,headers:{'Cache-Control':'no-store'}});
 return NextResponse.json({task,expires_at:task.expires_at},{headers:{'Cache-Control':'no-store'}});
}
