'use client';
import{useEffect,useState}from'react';import{useRouter}from'next/navigation';import Link from'next/link';import{AppShell}from'@/src/components/AppShell';import{LocationField}from'@/src/components/LocationField';

const templates=[['Food','Pick up food','Buy something to eat and bring it to me.'],['Groceries','Get groceries','Pick up groceries from a campus shop.'],['Pickup','Pick something up','Collect an item and bring it here.'],['Print','Printing','Print, collect or bind documents.']];
function nightWindow(){const h=new Date().getHours();return h>=22||h<5}
export default function DoPage(){
 const router=useRouter();const[busy,setBusy]=useState(false),[ready,setReady]=useState(true),[error,setError]=useState(''),[late,setLate]=useState(false);
 const[template,setTemplate]=useState(''),[title,setTitle]=useState(''),[description,setDescription]=useState('');
 const[pickup,setPickup]=useState(''),[destination,setDestination]=useState(''),[pickupKind,setPickupKind]=useState(''),[destinationKind,setDestinationKind]=useState('');
 const[item,setItem]=useState(''),[fee,setFee]=useState(''),[eta,setEta]=useState('30'),[when,setWhen]=useState(''),[mode,setMode]=useState<'LANDMARK'|'HOSTEL'|'ROOM'>('HOSTEL'),[room,setRoom]=useState('');
 useEffect(()=>{const f=()=>setLate(nightWindow());f();const t=window.setInterval(f,60000);return()=>window.clearInterval(t)},[]);
 const chooseTemplate=(name:string,desc:string)=>{setTemplate(name);if(!title)setTitle(name==='Food'?'Pick up food':'Carry out a task');if(!description)setDescription(desc)};
 const pick=(label:string,kind:string)=>{setPickup(label);setPickupKind(kind);if(!title)setTitle(kind==='Food'||kind==='Market'?'Pick up from '+label:'Go to '+label)};
 const drop=(label:string,kind:string)=>{setDestination(label);setDestinationKind(kind);if(kind==='Hostel')setMode('HOSTEL')};
 async function submit(){
  setBusy(true);setError('');
  const r=await fetch('/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title,description,pickup_location_text:pickup,destination_location_text:destination,estimated_item_cost_kobo:Math.max(0,Math.round(Number(item||0)*100)),proposed_runner_fee_kobo:Math.max(0,Math.round(Number(fee||0)*100)),proposed_eta_minutes:Number(eta||30),delivery_mode:mode,delivery_room:room,scheduled_for:when||null})});
  const j=await r.json();setBusy(false);
  if(r.status===401){setReady(false);return}
  if(!r.ok){setError(j.error||'Could not post this task.');return}
  router.push('/orders/'+j.task.id);
 }
 if(!ready)return <AppShell><main className="shell app-page narrow"><div className="card form"><h2>Sign in to use CarryGo.</h2><p className="sub">Your wallet, streaks and task history live on your account.</p><Link className="btn dark" href="/login">Sign in →</Link></div></main></AppShell>;
 return <AppShell><main className="shell app-page narrow">
  <div className="page-top"><div><div className="eyebrow">NEW TASK</div><h1 className="app-title">Tell us what needs doing.</h1><p className="sub">Type the places the way you normally say them. CarryGo handles the coordination.</p></div></div>
  {late&&<div className="late-banner"><strong>Hostel delivery only right now.</strong><span>From 10 PM to 5 AM, new jobs must end at a hostel or room. Full marketplace opens at 5 AM.</span></div>}
  <div className="template-row">{templates.map(([a,b,c])=><button type="button" key={a} className={template===a?'mini-choice active':'mini-choice'} onClick={()=>chooseTemplate(a,c)}><small>{a}</small><span>{b}</span></button>)}</div>
  <div className="card form task-form">
   <label>What exactly should happen?<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Get 2 bottles of water from Green Plaza and bring them to Portfolio 214."/></label>
   <div className="grid2"><LocationField label="Pick up from" value={pickup} onChange={setPickup} onSelect={p=>pick(p.label,p.kind)} placeholder="Omega, Green Plaza, ICT…"/><LocationField label="Bring it to" value={destination} onChange={setDestination} onSelect={p=>drop(p.label,p.kind)} placeholder="Portfolio Hostel, Senate…"/></div>
   <div className="micro-row">{pickupKind&&<span>Pickup · {pickupKind}</span>}{destinationKind&&<span>Drop · {destinationKind}</span>}<span>Free text works too.</span></div>
   <div className="grid3"><label>Item estimate<input inputMode="numeric" value={item} onChange={e=>setItem(e.target.value)} placeholder="2500"/></label><label>Opening runner fee<input inputMode="numeric" value={fee} onChange={e=>setFee(e.target.value)} placeholder="500"/></label><label>ETA offered<input inputMode="numeric" value={eta} onChange={e=>setEta(e.target.value)} placeholder="30"/></label></div>
   <div className="grid2"><label>Bring it when<input type="datetime-local" value={when} onChange={e=>setWhen(e.target.value)}/><small className="hint">Blank = as soon as possible.</small></label><div className="summary-hint"><b>Price + time are negotiable.</b><span>Runners can counter both before you fund.</span></div></div>
   <label>Delivery type</label><div className="choice-grid">{[['LANDMARK','Meet-up','A point you choose'],['HOSTEL','Hostel','Any eligible runner'],['ROOM','Room','Same gender · higher fee']].map(([v,t,d])=><button type="button" key={v} onClick={()=>{if(v==='LANDMARK'&&late){setError('Meet-up delivery is unavailable after 10 PM.');return}setMode(v as any)}} className={mode===v?'choice on':'choice'} disabled={v==='LANDMARK'&&late}><b>{t}</b><span>{late&&v==='LANDMARK'?'Available from 5 AM':d}</span></button>)}</div>
   {mode==='ROOM'&&<><label>Room<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="214"/></label><div className="note">Room delivery is always same-gender. The room premium goes to runner compensation.</div></>}
   {error&&<div className="error" role="alert">{error}</div>}
   <button className="btn dark full sticky-submit" disabled={busy||!description||!pickup||!destination||!fee} onClick={submit}>{busy?'Posting…':'Post task →'}</button>
  </div>
 </main></AppShell>
}