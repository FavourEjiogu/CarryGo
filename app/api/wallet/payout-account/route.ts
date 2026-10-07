import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET() {
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data,error}=await s.from('payout_accounts').select('id,bank_code,bank_name,account_name,account_number_last4,is_default,created_at').eq('user_id',user.id).eq('is_default',true).maybeSingle();
  if(error)return NextResponse.json({error:'Could not load payout account.'},{status:400});
  return NextResponse.json({account:data||null});
}

export async function POST(request:Request){
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)return NextResponse.json({error:'PAYMENTS_NOT_CONFIGURED'},{status:503});
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:allowed,error:rateError}=await s.rpc('consume_rate_limit',{p_scope:'payout-account',p_limit:5,p_window_seconds:86400});
  if(rateError)return NextResponse.json({error:'Could not verify request limits. Try again.'},{status:503});
  if(!allowed)return NextResponse.json({error:'Payout account changes are limited. Try again tomorrow.'},{status:429,headers:{'retry-after':'3600'}});
  const b=await request.json().catch(()=>({}));
  const bankCode=String(b.bank_code||'').trim();
  const accountNumber=String(b.account_number||'').replace(/\D/g,'');
  const name=String(b.account_name||user.user_metadata?.display_name||'').trim().slice(0,100);
  if(!/^\d{3,6}$/.test(bankCode)||!/^\d{10}$/.test(accountNumber)||name.length<2)return NextResponse.json({error:'Enter a valid bank, 10-digit account number and account name.'},{status:400});
  const response=await fetch('https://api.paystack.co/transferrecipient',{method:'POST',headers:{Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({type:'nuban',name,account_number:accountNumber,bank_code:bankCode,currency:'NGN'})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.status||!result?.data?.recipient_code)return NextResponse.json({error:result?.message||'Could not verify this bank account.'},{status:502});
  const recipient=result.data;
  const verifiedName=String(recipient.details?.account_name||recipient.name||name).trim().slice(0,100);
  const bankName=String(recipient.details?.bank_name||'').trim().slice(0,100);
  const {data:id,error}=await s.rpc('save_payout_account',{p_recipient_code:recipient.recipient_code,p_bank_code:bankCode,p_bank_name:bankName||null,p_account_name:verifiedName,p_account_number_last4:accountNumber.slice(-4)});
  if(error)return NextResponse.json({error:'Could not save payout account.'},{status:400});
  return NextResponse.json({account:{id,bank_code:bankCode,bank_name:bankName||null,account_name:verifiedName,account_number_last4:accountNumber.slice(-4),is_default:true}});
}
