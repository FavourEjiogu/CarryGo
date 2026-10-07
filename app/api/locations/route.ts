import{NextResponse}from'next/server';import{createSupabaseServerClient}from'@/src/lib/supabase/server';
export async function GET(){
 const s=await createSupabaseServerClient();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const{data:profile,error:profileError}=await s.from('users').select('campus_id').eq('id',user.id).single();if(profileError||!profile?.campus_id)return NextResponse.json({locations:[]});
 const{data,error}=await s.from('campus_locations').select('id,name,location_type').eq('campus_id',profile.campus_id).eq('is_public',true).eq('is_active',true).order('name').limit(150);
 if(error)return NextResponse.json({error:'Could not load campus locations'},{status:500});
 return NextResponse.json({locations:data||[]},{headers:{'Cache-Control':'private, no-store'}});
}