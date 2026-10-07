'use client';
import{useEffect,useRef,useState}from'react';import{useRouter}from'next/navigation';import Link from'next/link';import{AppShell}from'@/src/components/AppShell';import{LocationField}from'@/src/components/LocationField';import{parseTaskRoute, type ParsedTaskRoute}from'@/src/lib/task-parser';
import{Icon}from'@/src/components/icons';

const templates=[['Food','Pick up food','Buy something to eat and bring it to me.'],['Groceries','Get groceries','Pick up groceries from a campus shop.'],['Pickup','Pick something up','Collect an item and bring it here.'],['Print','Printing','Print, collect or bind documents.']];
function nightWindow(){const h=new Date().getHours();return h>=22||h<5}
export default function DoPage(){
 const router=useRouter();const[busy,setBusy]=useState(false),[ready,setReady]=useState(true),[error,setError]=useState(''),[late,setLate]=useState(false);
 const[template,setTemplate]=useState(''),[title,setTitle]=useState(''),[description,setDescription]=useState('');
 const[pickup,setPickup]=useState(''),[destination,setDestination]=useState(''),[pickupKind,setPickupKind]=useState(''),[destinationKind,setDestinationKind]=useState('');
 const[item,setItem]=useState(''),[fee,setFee]=useState(''),[eta,setEta]=useState('30'),[when,setWhen]=useState(''),[mode,setMode]=useState<'LANDMARK'|'HOSTEL'|'ROOM'>('HOSTEL'),[room,setRoom]=useState('');
 const[detectedRoute,setDetectedRoute]=useState<ParsedTaskRoute|null>(null);const routeTouched=useRef({pickup:false,destination:false});

 useEffect(()=>{const f=()=>setLate(nightWindow());f();const t=window.setInterval(f,60000);return()=>window.clearInterval(t)},[]);
 useEffect(()=>{const timer=window.setTimeout(()=>{const parsed=parseTaskRoute(description);setDetectedRoute(parsed);if(parsed){if(!routeTouched.current.pickup)setPickup(parsed.pickup);if(!routeTouched.current.destination)setDestination(parsed.destination)}},180);return()=>window.clearTimeout(timer)},[description]);

 const chooseTemplate=(name:string,desc:string)=>{setTemplate(name);if(!title)setTitle(name==='Food'?'Pick up food':'Carry out a task');if(!description)setDescription(desc)};
 const pick=(label:string,kind:string)=>{routeTouched.current.pickup=true;setPickup(label);setPickupKind(kind);if(!title)setTitle(kind==='Food'||kind==='Market'?'Pick up from '+label:'Go to '+label)};
 const drop=(label:string,kind:string)=>{routeTouched.current.destination=true;setDestination(label);setDestinationKind(kind);if(kind==='Hostel')setMode('HOSTEL')};
 const changePickup=(value:string)=>{routeTouched.current.pickup=true;setPickup(value);setPickupKind('')};
 const changeDestination=(value:string)=>{routeTouched.current.destination=true;setDestination(value);setDestinationKind('')};
 const applyDetected=()=>{if(!detectedRoute)return;routeTouched.current={pickup:false,destination:false};setPickup(detectedRoute.pickup);setDestination(detectedRoute.destination);setPickupKind('');setDestinationKind('')};
 const swapLocations=()=>{routeTouched.current={pickup:true,destination:true};const p=pickup,d=destination,pk=pickupKind,dk=destinationKind;setPickup(d);setDestination(p);setPickupKind(dk);setDestinationKind(pk)};
 async function submit(){
  setBusy(true);setError('');
  const r=await fetch('/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:title||'Task request',description,pickup_location_text:pickup,destination_location_text:destination,estimated_item_cost_kobo:Math.max(0,Math.round(Number(item||0)*100)),proposed_runner_fee_kobo:Math.max(0,Math.round(Number(fee||0)*100)),proposed_eta_minutes:Number(eta||30),delivery_mode:mode,delivery_room:room,scheduled_for:when||null})});
  const j=await r.json();setBusy(false);if(r.status===401){setReady(false);return}if(!r.ok){setError(j.error||'Could not post this task.');return}router.push('/orders/'+j.task.id);
 }
 if(!ready)return <AppShell><main className="shell app-page narrow"><div className="card form"><h2>Sign in to use CarryGo.</h2><p className="sub">Your wallet, streaks and task history live on your account.</p><Link className="btn dark" href="/login">Sign in →</Link></div></main></AppShell>;
 return <AppShell><main className="shell app-page narrow">
  <div className="page-top"><div><div className="eyebrow">NEW TASK</div><h1 className="app-title">Tell us what needs doing.</h1><p className="sub">Type the request naturally. We’ll turn the useful parts into task details.</p></div></div>
  {late&&<div className="late-banner"><strong>Hostel delivery only right now.</strong><span>From 10 PM to 5 AM, new jobs must end at a hostel or room.</span></div>}
  <div className="template-row">{templates.map(([a,b,c])=><button type="button" key={a} className={template===a?'mini-choice active':'mini-choice'} onClick={()=>chooseTemplate(a,c)}><small>{a}</small><span>{b}</span></button>)}</div>
  <div className="card form task-form">
   <label>What exactly should happen?<textarea value={description} onChange={e=>{setDescription(e.target.value);setError('')}} placeholder="Get 2 bottles of water from Green Plaza and bring them to Portfolio 214."/></label>
   {detectedRoute&&<div className="smart-route" role="status"><div><Icon name="map" size={16}/><span><b>We spotted the route</b><small>{detectedRoute.pickup} → {detectedRoute.destination}</small></span></div><button type="button" className="text-link" onClick={applyDetected}>Use this route</button></div>}
   <div className="grid2">
    <LocationField label="Pick up from" value={pickup} onChange={changePickup} onSelect={p=>pick(p.label,p.kind)} placeholder="Omega, Green Plaza, ICT…"/>
    <div className="destination-wrap"><LocationField label="Bring it to" value={destination} onChange={changeDestination} onSelect={p=>drop(p.label,p.kind)} placeholder="Portfolio Hostel, Senate…"/><button type="button" className="swap-locations" onClick={swapLocations} aria-label="Swap pickup and destination"><Icon name="swap" size={14}/></button></div>
   </div>
   <div className="micro-row">{pickupKind&&<span>Pickup · {pickupKind}</span>}{destinationKind&&<span>Drop · {destinationKind}</span>}<span>{detectedRoute?'Route can be edited before posting.':'Free text works too.'}</span></div>
   <div className="grid3"><label>Item estimate<input inputMode="numeric" value={item} onChange={e=>setItem(e.target.value)} placeholder="2500"/></label><label>Opening runner fee<input inputMode="numeric" value={fee} onChange={e=>setFee(e.target.value)} placeholder="500"/></label><label>ETA offered<input inputMode="numeric" value={eta} onChange={e=>setEta(e.target.value)} placeholder="30"/></label></div>
   <div className="grid2"><label>Bring it when<input type="datetime-local" value={when} onChange={e=>setWhen(e.target.value)}/><small className="hint">Blank = as soon as possible.</small></label><div className="summary-hint"><b>Price + time are negotiable.</b><span>Runners can counter both before you fund.</span></div></div>
   <label>Delivery type</label><div className="choice-grid">{[['LANDMARK','Meet-up','A point you choose'],['HOSTEL','Hostel','Any eligible runner'],['ROOM','Room','Same gender · higher fee']].map(([v,t,d])=><button type="button" key={v} onClick={()=>{if(v==='LANDMARK'&&late){setError('Meet-up delivery is unavailable after 10 PM.');return}setMode(v as any)}} className={mode===v?'choice on':'choice'} disabled={v==='LANDMARK'&&late}><b>{t}</b><span>{late&&v==='LANDMARK'?'Available from 5 AM':d}</span></button>)}</div>
   {mode==='ROOM'&&<><label>Room<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="214"/></label><div className="note">Room delivery is always same-gender. The room premium goes to runner compensation.</div></>}
   {error&&<div className="error" role="alert">{error}</div>}
   <button className="btn dark full sticky-submit" disabled={busy||!description||!pickup||!destination||!fee} onClick={submit}>{busy?'Posting…':'Post task →'}</button>
  </div>
 </main></AppShell>
}