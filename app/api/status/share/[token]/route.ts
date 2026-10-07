import{createHash}from'node:crypto';
import{NextResponse}from'next/server';
import{createSupabaseAdminClient}from'@/src/lib/supabase/admin';

export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){
 const{token}=await params;
 if(!token||token.length<20||token.length>128)return NextResponse.json({error:'Status link not found.'},{status:404,headers:{'Cache-Control':'no-store'}});
 const hash=createHash('sha256').update(token).digest('hex');
 const admin=createSupabaseAdminClient();
 const{data,error}=await admin.from('shared_task_status').select('expires_at,revoked_at,errand_id').eq('token_hash',hash).maybeSingle();
 if(error||!data||data.revoked_at||new Date(data.expires_at)<=new Date())return NextResponse.json({error:'This status link has expired.'},{status:410,headers:{'Cache-Control':'no-store'}});
 const{data:task}=await admin.from('errands').select('title,status,pickup_location_text,destination_location_text,updated_at,scheduled_for').eq('id',data.errand_id).maybeSingle();
 if(!task)return NextResponse.json({error:'Status link not found.'},{status:404,headers:{'Cache-Control':'no-store'}});
 return NextResponse.json({
   task:{
     title:task.title,
     status:task.status,
     pickup:task.pickup_location_text,
     destination:task.destination_location_text,
     updated_at:task.updated_at,
     scheduled_for:task.scheduled_for,
   },
   expires_at:data.expires_at,
 },{headers:{'Cache-Control':'no-store'}});
}
