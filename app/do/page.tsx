'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/src/components/AppShell';

export default function DoPage(){
  const router=useRouter();
  const [authed,setAuthed]=useState<boolean|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const [title,setTitle]=useState(''),[description,setDescription]=useState('');
  const [pickup,setPickup]=useState(''),[destination,setDestination]=useState('');
  const [item,setItem]=useState(''),[fee,setFee]=useState(''),[eta,setEta]=useState('30');
  const [mode,setMode]=useState<'LANDMARK'|'HOSTEL'|'ROOM'>('HOSTEL'),[room,setRoom]=useState(''),[when,setWhen]=useState('');
  useEffect(()=>{fetch('/api/me').then(r=>setAuthed(r.ok)).catch(()=>setAuthed(false))},[]);
  async function submit(){
    setBusy(true);setError('');
    const r=await fetch('/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      title,description,pickup_location_text:pickup,destination_location_text:destination,
      estimated_item_cost_kobo:Math.max(0,Math.round(Number(item||0)*100)),
      proposed_runner_fee_kobo:Math.max(0,Math.round(Number(fee||0)*100)),
      proposed_eta_minutes:Number(eta||30),delivery_mode:mode,delivery_room:room,scheduled_for:when||null
    })});
    const j=await r.json();setBusy(false);
    if(!r.ok){setError(j.error||'Could not post task.');return}
    router.push('/orders/'+j.task.id);
  }
  if(authed===null)return <AppShell><main className="shell page-pad"><div className="card form"><h2>Loading CarryGo…</h2></div></main></AppShell>;
  if(!authed)return <AppShell><main className="shell page-pad narrow"><div className="card success"><div className="pill">ONE STEP</div><h2>Sign in before you <em>carry on.</em></h2><p className="lead">Your tasks, streaks and runner reputation belong to your account.</p><Link className="btn dark" href="/login">Sign in →</Link></div></main></AppShell>;
  return <AppShell><main className="shell page-pad narrow">
    <div className="pill">NEW TASK · BINGHAM KARU</div><h1>What should we <em>carry?</em></h1>
    <p className="lead">Type the places exactly how you know them. Your runner can chat with you to confirm before moving.</p>
    <div className="card form">
      <label>Task title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Buy lunch from Omega"/></label>
      <label>What exactly should happen?<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="2 rice + chicken. Bring it to Portfolio 214."/></label>
      <div className="grid2">
        <label>Pickup<input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Omega"/></label>
        <label>Bring it to<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Portfolio Hostel"/></label>
      </div>
      <div className="grid3">
        <label>Item estimate<input inputMode="numeric" value={item} onChange={e=>setItem(e.target.value)} placeholder="2500"/></label>
        <label>Opening runner fee<input inputMode="numeric" value={fee} onChange={e=>setFee(e.target.value)} placeholder="500"/></label>
        <label>ETA offered (min)<input inputMode="numeric" value={eta} onChange={e=>setEta(e.target.value)} /></label>
      </div>
      <label>When?<input type="datetime-local" value={when} onChange={e=>setWhen(e.target.value)}/><small className="hint">Blank = as soon as possible.</small></label>
      <label>Delivery</label>
      <div className="choice-grid">
        {[['LANDMARK','Meet-up','Meet at a point you choose'],['HOSTEL','Hostel','Normal hostel delivery · any eligible runner'],['ROOM','Room','Same gender only · higher delivery fee']].map(([v,t,d])=><button type="button" className={mode===v?'choice on':'choice'} key={v} onClick={()=>setMode(v as any)}><b>{t}</b><span>{d}</span></button>)}
      </div>
      {mode==='ROOM'&&<><label>Room<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="214"/></label><div className="note">Room delivery is always same-gender and carries a higher delivery premium.</div></>}
      {mode==='HOSTEL'&&<div className="note">Normal hostel delivery can use any eligible runner.</div>}
      {error&&<div className="error">{error}</div>}
      <button className="btn dark full" disabled={busy||!title||!description||!pickup||!destination||!fee} onClick={submit}>{busy?'Posting…':'Post task →'}</button>
    </div>
  </main></AppShell>;
}
