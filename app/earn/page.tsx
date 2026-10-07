'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/src/components/AppShell';
import { naira } from '@/src/lib/app-config';

export default function Earn(){
  const [tasks,setTasks]=useState<any[]>([]),[login,setLogin]=useState(false),[offline,setOffline]=useState(false),[error,setError]=useState('');
  const [busy,setBusy]=useState<string|null>(null);
  useEffect(()=>{load()},[]);
  async function load(){try{const r=await fetch('/api/tasks');if(r.status===401){setLogin(true);return}const j=await r.json();setTasks(j.tasks||[]);setOffline(j.open===false)}catch{setError('Weak connection. Try again.')}}
  async function bid(id:string){const fee=window.prompt('Your runner fee in ₦?');if(!fee)return;const eta=window.prompt('Your ETA in minutes?','20');if(!eta)return;setBusy(id);const res=await fetch('/api/tasks/'+id+'/bids',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({fee_kobo:Number(fee)*100,eta_minutes:Number(eta),runner_float_capacity_kobo:Number(window.prompt('How much can you front for the purchase (₦)?','5000')||0)*100})});const j=await res.json();setBusy(null);if(!res.ok){setError(j.error||'Offer failed.');return}setTasks(x=>x.filter(t=>t.id!==id))}
  if(login)return <AppShell><main className="shell page-pad narrow"><div className="card success"><h2>Ready to <em>earn?</em></h2><p className="lead">Sign in and turn the routes you already take into money.</p><Link className="btn dark" href="/login">Sign in →</Link></div></main></AppShell>;
  return <AppShell><main className="shell page-pad"><div className="pill">RUNNER MARKET · BINGHAM KARU</div><h1>Get paid for <em>going.</em></h1><p className="lead">CarryGo lets you trade time and fee instead of forcing one fixed delivery price.</p>{offline&&<div className="note">CarryGo is sleeping. New jobs resume at 5:00 AM.</div>}{error&&<div className="error">{error}</div>}<div className="task-list">{tasks.length?tasks.map(t=><article className="card task" key={t.id}><div><b>{t.title}</b><span>{t.pickup_location_text} → {t.destination_location_text} · {t.proposed_eta_minutes} min</span><div className="chips"><i>{t.delivery_mode==='ROOM'?'same-gender room':'any eligible runner'}</i><i>{naira(t.estimated_item_cost_kobo)} item capital</i></div></div><div className="task-action"><strong>{naira(t.proposed_runner_fee_kobo)}</strong><small>opening fee</small><button className="btn dark" disabled={busy===t.id} onClick={()=>bid(t.id)}>{busy===t.id?'Sending…':'Make offer'}</button></div></article>):<div className="card success"><h2>No open tasks right now.</h2><p className="lead">That is a supply problem we want to solve.</p><Link className="btn ghost" href="/do">Post a task →</Link></div>}</div></main></AppShell>;
}
