import{NextResponse}from'next/server';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request:Request){
 const s=await createSupabaseServerClient();
 const{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const q=new URL(request.url).searchParams;
 const pickup=q.get('pickup_id')||'',destination=q.get('destination_id')||'';
 if(!uuid.test(pickup)||!uuid.test(destination))return NextResponse.json({suggestion:null});
 const{data,error}=await s.rpc('get_route_suggestion',{p_pickup_location_id:pickup,p_destination_location_id:destination});
 if(error)return NextResponse.json({error:'Could not load route suggestions.'},{status:500});
 const row=Array.isArray(data)?data[0]:data;
 return NextResponse.json({suggestion:row?.sample_count>=3?row:null},{headers:{'Cache-Control':'private, no-store'}});
}
