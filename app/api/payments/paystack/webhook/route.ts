import{NextResponse}from'next/server';import crypto from'node:crypto';import{createSupabaseAdminClient}from'@/src/lib/supabase/admin';

export async function POST(request:Request){
 const secret=process.env.PAYSTACK_SECRET_KEY;
 if(!secret)return NextResponse.json({received:true});
 const raw=await request.text(),sig=request.headers.get('x-paystack-signature')||'',hash=crypto.createHmac('sha512',secret).update(raw).digest('hex');
 if(sig.length!==hash.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(hash)))return NextResponse.json({error:'Invalid signature'},{status:401});
 let event:any;try{event=JSON.parse(raw)}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const admin=createSupabaseAdminClient();
 if(event.event==='charge.success'){
   const ref=event.data?.reference,amount=Number(event.data?.amount||0),meta=event.data?.metadata||{};
   if(!ref||!Number.isSafeInteger(amount)||amount<=0)return NextResponse.json({received:true});
   if(meta.type==='WALLET_TOPUP'&&meta.wallet_topup_id)await admin.rpc('finalize_wallet_topup',{p_topup_id:meta.wallet_topup_id,p_amount_kobo:amount,p_provider_reference:ref});
   else if(meta.funding_intent_id)await admin.rpc('finalize_funding_success',{p_funding_intent_id:meta.funding_intent_id,p_amount_kobo:amount,p_provider_reference:ref});
   return NextResponse.json({received:true});
 }
 if(['transfer.success','transfer.failed','transfer.reversed'].includes(event.event)){
   const ref=event.data?.reference,amount=Number(event.data?.amount||0),code=event.data?.transfer_code||null;
   if(!ref||!Number.isSafeInteger(amount)||amount<=0)return NextResponse.json({received:true});
   const status=event.event==='transfer.success'?'SUCCESS':event.event==='transfer.failed'?'FAILED':'REVERSED';
   const {error}=await admin.rpc('finalize_withdrawal',{p_provider_reference:ref,p_amount_kobo:amount,p_status:status,p_provider_transfer_code:code});
   if(error)return NextResponse.json({error:'Could not settle transfer.'},{status:500});
 }
 return NextResponse.json({received:true});
}
