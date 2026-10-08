import type{Metadata}from'next';
import{createHash}from'node:crypto';
import{createSupabaseServerClient}from'@/src/lib/supabase/server';

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
 const s=await createSupabaseServerClient();
 const{data:rows}=await s.rpc('get_shared_task_status',{p_token_hash:hash});
 const task=rows?.[0];
 let content=<div className="error" role="alert">This status link is unavailable or has expired.</div>;
 if(task){
   content=<>
     <div className="section-label"><span>LIVE</span><span>Expires {new Date(task.expires_at).toLocaleTimeString()}</span></div>
     <h2>{task.title}</h2>
     <div className="shared-route"><span>{task.pickup_location_text||'Pickup'}</span><b>→</b><span>{task.destination_location_text||'Destination'}</span></div>
     <strong className="shared-state">{labels[task.status]||String(task.status).replaceAll('_',' ')}</strong>
     <small>Updated {new Date(task.updated_at).toLocaleTimeString()}</small>
   </>;
 }
 return <main className="shell app-page narrow shared-status-page">
   <div className="eyebrow">CARRYGO · SHARED STATUS</div>
   <h1 className="app-title">Delivery <em>status.</em></h1>
   <div className="card form">{content}<p className="soft-note">This page shows only this delivery. It does not expose your account or location history.</p></div>
 </main>;
}
