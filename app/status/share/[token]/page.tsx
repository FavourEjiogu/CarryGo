import type{Metadata}from'next';
import{createHash}from'node:crypto';
import{createSupabaseAdminClient}from'@/src/lib/supabase/admin';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'CarryGo status',robots:{index:false,follow:false}};

const labels:Record<string,string>={
 OPEN:'Waiting for a runner',NEGOTIATING:'Choosing a runner',AGREED:'Runner selected',
 FUNDING:'Funding in progress',FUNDED:'Ready to start',IN_PROGRESS:'Runner has started',
 AT_VENDOR:'At pickup',PRICE_ADJUSTMENT_PENDING:'Price check needed',ITEM_CONFIRMED:'Item secured',
 EN_ROUTE:'On the way',HANDOFF_PENDING:'Arriving for handoff',COMPLETED:'Completed',
 CANCELLED:'Cancelled',EXPIRED:'Expired',FAILED:'Failed',DISPUTED:'Disputed',ABANDONED:'Closed',
};

export default async function SharedStatus({params}:{params:Promise<{token:string}>}){
 const{token}=await params;
 const hash=createHash('sha256').update(token||'').digest('hex');
 const admin=createSupabaseAdminClient();
 const{data:share}=await admin.from('shared_task_status').select('expires_at,revoked_at,errand_id').eq('token_hash',hash).maybeSingle();
 let content=<div className="error" role="alert">This status link is unavailable.</div>;
 if(share&&!share.revoked_at&&new Date(share.expires_at)>new Date()){
   const{data:task}=await admin.from('errands').select('title,status,pickup_location_text,destination_location_text,updated_at,scheduled_for').eq('id',share.errand_id).maybeSingle();
   if(task){
     content=<>
       <div className="section-label"><span>LIVE</span><span>Expires {new Date(share.expires_at).toLocaleTimeString()}</span></div>
       <h2>{task.title}</h2>
       <div className="shared-route"><span>{task.pickup_location_text||'Pickup'}</span><b>→</b><span>{task.destination_location_text||'Destination'}</span></div>
       <strong className="shared-state">{labels[task.status]||task.status.replaceAll('_',' ')}</strong>
       <small>Updated {new Date(task.updated_at).toLocaleTimeString()}</small>
     </>;
   }
 } else if(share){
   content=<div className="error" role="alert">This status link has expired.</div>;
 }
 return <main className="shell app-page narrow shared-status-page">
   <div className="eyebrow">CARRYGO · SHARED STATUS</div>
   <h1 className="app-title">Delivery status</h1>
   <div className="card form">{content}<p className="soft-note">This page shows only this delivery. It does not expose your account or location history.</p></div>
 </main>;
}
