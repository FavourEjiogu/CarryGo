import{NextResponse}from'next/server';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';
import{resolveCampusPlace,type CampusPlace}from'@/src/lib/place-resolution';

export async function GET(request:Request){
 const s=await createSupabaseServerClient();
 const{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const query=new URL(request.url).searchParams.get('q')?.trim().slice(0,120)||'';
 if(query.length<2)return NextResponse.json({match:null});
 const{data:profile}=await s.from('users').select('campus_id').eq('id',user.id).maybeSingle();
 if(!profile?.campus_id)return NextResponse.json({match:null});
 const{data,error}=await s.from('campus_locations').select('id,name,location_type,merchants(id,name,category,verification_status,storefront_enabled,average_prep_minutes)').eq('campus_id',profile.campus_id).eq('is_public',true).eq('is_active',true).order('name').limit(150);
 if(error)return NextResponse.json({error:'Could not resolve campus place.'},{status:500});
 const places:CampusPlace[]=(data||[]).map((x:any)=>({label:x.name,locationId:x.id,kind:x.location_type==='HOSTEL'||x.location_type==='ROOM'?'Hostel':x.location_type==='FOOD'||x.location_type==='MERCHANT'||x.location_type==='SHOP'?'Food':x.location_type==='CAMPUS'?'Campus':'Landmark',merchant:x.merchants?.[0]?{id:x.merchants[0].id,name:x.merchants[0].name,category:x.merchants[0].category,verificationStatus:x.merchants[0].verification_status,storefrontEnabled:x.merchants[0].storefront_enabled,averagePrepMinutes:x.merchants[0].average_prep_minutes??null}:undefined}));
 const match=resolveCampusPlace(query,places);
 return NextResponse.json({match:match?{...match.place,confidence:match.confidence}:null},{headers:{'Cache-Control':'private, no-store'}});
}
