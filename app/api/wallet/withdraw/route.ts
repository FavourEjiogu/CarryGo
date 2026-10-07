import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET(){
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const [wallet,account,withdrawals]=await Promise.all([
    s.rpc('get_wallet_summary',{p_user_id:user.id}),
    s.from('payout_accounts').select('id,bank_code,bank_name,account_name,account_number_last4,is_default').eq('user_id',user.id).eq('is_default',true).maybeSingle(),
    s.from('withdrawals').select('id,amount_kobo,status,provider_reference,requested_at,processed_at,payout_account_id').eq('user_id',user.id).order('requested_at',{ascending:false}).limit(10),
  ]);
  if(wallet.error)return NextResponse.json({error:'Could not load earnings.'},{status:400});
  return NextResponse.json({wallet:wallet.data,account:account.data||null,withdrawals:withdrawals.data||[]});
}

export async function POST(request:Request){
  const s=await createSupabaseServerClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:allowed,error:rateError}=await s.rpc('consume_rate_limit',{p_scope:'withdrawal',p_limit:3,p_window_seconds:3600});
  if(rateError)return NextResponse.json({error:'Could not verify request limits. Try again.'},{status:503});
  if(!allowed)return NextResponse.json({error:'Withdrawal limit reached. Try again later.'},{status:429,headers:{'retry-after':'300'}});
  const b=await request.json().catch(()=>({}));
  const payoutAccountId=String(b.payout_account_id||'');
  const amount=Math.round(Number(b.amount_kobo||0));
  if(!payoutAccountId||!Number.isInteger(amount))return NextResponse.json({error:'Enter a valid withdrawal.'},{status:400});
  const {data,reserveError}=await s.rpc('request_withdrawal',{p_payout_account_id:payoutAccountId,p_amount_kobo:amount});
  if(reserveError)return NextResponse.json({error:reserveError.message},{status:400});

  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)return NextResponse.json({error:'Payments are not configured.'},{status:503});
  const transfer=await fetch('https://api.paystack.co/transfer',{method:'POST',headers:{Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({source:'balance',amount,currency:'NGN',recipient:data.recipient_code,reference:data.provider_reference,reason:'CarryGo runner payout'})});
  const result=await transfer.json().catch(()=>null);
  const admin=createSupabaseAdminClient();
  if(!transfer.ok||!result?.status){
    await admin.rpc('finalize_withdrawal',{p_provider_reference:data.provider_reference,p_amount_kobo:amount,p_status:'FAILED',p_provider_transfer_code:result?.data?.transfer_code||null});
    return NextResponse.json({error:result?.message||'Payout could not be started. Your earnings were returned.'},{status:502});
  }
  const providerStatus=String(result.data?.status||'pending').toUpperCase();
  if(providerStatus==='SUCCESS')await admin.rpc('finalize_withdrawal',{p_provider_reference:data.provider_reference,p_amount_kobo:amount,p_status:'SUCCESS',p_provider_transfer_code:result.data?.transfer_code||null});
  else await admin.rpc('finalize_withdrawal',{p_provider_reference:data.provider_reference,p_amount_kobo:amount,p_status:'PROCESSING',p_provider_transfer_code:result.data?.transfer_code||null});
  return NextResponse.json({withdrawal_id:data.withdrawal_id,status:providerStatus==='SUCCESS'?'SUCCESS':'PROCESSING',amount_kobo:amount});
}
