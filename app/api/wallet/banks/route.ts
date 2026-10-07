import { NextResponse } from 'next/server';

export const revalidate=86400;

export async function GET(){
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)return NextResponse.json({error:'PAYMENTS_NOT_CONFIGURED'},{status:503});
  const response=await fetch('https://api.paystack.co/bank?country=nigeria&currency=NGN&perPage=100',{headers:{Authorization:'Bearer '+secret},next:{revalidate:86400}});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.status)return NextResponse.json({error:'Could not load banks.'},{status:502});
  const banks=(result.data||[]).filter((x:any)=>x.active).map((x:any)=>({name:String(x.name),code:String(x.code)})).sort((a:any,b:any)=>a.name.localeCompare(b.name));
  return NextResponse.json({banks});
}
