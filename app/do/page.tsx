'use client';
import{useEffect,useRef,useState}from'react';
import{useRouter}from'next/navigation';
import Link from'next/link';
import{AppShell}from'@/src/components/AppShell';
import{LocationField, type PlaceSuggestion}from'@/src/components/LocationField';
import{parseTask,type ParsedTask,suggestedTaskTitle}from'@/src/lib/task-parser';
import{track}from'@/src/lib/analytics';
import{Icon}from'@/src/components/icons';

const templates=[['Food','Pick up food','Buy something to eat and bring it to me.'],['Groceries','Get groceries','Pick up groceries from a campus shop.'],['Pickup','Pick something up','Collect an item and bring it here.'],['Print','Printing','Print, collect or bind documents.']];
function nightWindow(){const h=new Date().getHours();return h>=22||h<5}
function localDateTimeValue(date:Date){const pad=(n:number)=>String(n).padStart(2,'0');return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes())}
function timingToLocalInput(text:string|null){if(!text)return null;const lower=text.toLowerCase();const tomorrow=lower.includes('tomorrow'),match=lower.match(/(?:by|before|at)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);const now=new Date();const date=new Date(now);if(tomorrow)date.setDate(date.getDate()+1);if(!match){if(tomorrow){date.setSeconds(0,0);return localDateTimeValue(date)}return null}let hour=Number(match[1]),minute=Number(match[2]||0);const period=match[3]?.toLowerCase();if(period==='pm'&&hour<12)hour+=12;if(period==='am'&&hour===12)hour=0;date.setHours(hour,minute,0,0);if(!tomorrow&&date<=now)date.setDate(date.getDate()+1);return localDateTimeValue(date)}
async function resolve(query:string){const r=await fetch('/api/locations/resolve?q='+encodeURIComponent(query),{cache:'no-store'});if(!r.ok)return null;const j=await r.json();return j.match||null}

export default function DoPage(){
 const router=useRouter();
 const[busy,setBusy]=useState(false),[ready,setReady]=useState(true),[error,setError]=useState(''),[late,setLate]=useState(false);
 const[template,setTemplate]=useState(''),[title,setTitle]=useState(''),[description,setDescription]=useState('');
 const[pickup,setPickup]=useState(''),[destination,setDestination]=useState(''),[pickupKind,setPickupKind]=useState(''),[destinationKind,setDestinationKind]=useState('');
 const[pickupId,setPickupId]=useState<string|null>(null),[destinationId,setDestinationId]=useState<string|null>(null),[pickupMerchant,setPickupMerchant]=useState<PlaceSuggestion['merchant']>();
 const[itemName,setItemName]=useState(''),[quantity,setQuantity]=useState('1'),[itemCost,setItemCost]=useState(''),[fee,setFee]=useState(''),[eta,setEta]=useState('30'),[when,setWhen]=useState(''),[mode,setMode]=useState<'LANDMARK'|'HOSTEL'|'ROOM'>('HOSTEL'),[room,setRoom]=useState('');
 const[understanding,setUnderstanding]=useState<ParsedTask|null>(null),[suggestion,setSuggestion]=useState<any>(null);
 const[timingApplied,setTimingApplied]=useState(false);
 const touched=useRef({pickup:false,destination:false,item:false,quantity:false,mode:false,title:false});
 const lastTracked=useRef('');

 useEffect(()=>{const f=()=>setLate(nightWindow());f();const t=window.setInterval(f,60000);return()=>window.clearInterval(t)},[]);
 useEffect(()=>{
   const timer=window.setTimeout(async()=>{
     const parsed=parseTask(description);
     setUnderstanding(parsed);
     if(!parsed)return;
     const candidateTitle=suggestedTaskTitle(parsed);
     if(candidateTitle&&!touched.current.title&&!title)setTitle(candidateTitle);
     if(parsed.item&&!touched.current.item)setItemName(parsed.item);
     if(parsed.quantity&&!touched.current.quantity)setQuantity(String(parsed.quantity));
     if(parsed.deliveryType&&!touched.current.mode)setMode(parsed.deliveryType);
     if(parsed.timingText&&!when&&!timingApplied){const local=timingToLocalInput(parsed.timingText);if(local)setWhen(local)}
     if((parsed.pickup&&!touched.current.pickup)||(parsed.destination&&!touched.current.destination)){
       const queries=[parsed.pickup,parsed.destination].filter(Boolean) as string[];
       const matches=await Promise.all(queries.map(resolve));
       let index=0;
       if(parsed.pickup&&!touched.current.pickup){const match=matches[index++];if(match){setPickup(match.name);setPickupId(match.id);setPickupKind(match.kind||'');setPickupMerchant(match.merchant||undefined)}else setPickup(parsed.pickup)}
       if(parsed.destination&&!touched.current.destination){const match=matches[index++];if(match){setDestination(match.name);setDestinationId(match.id);setDestinationKind(match.kind||'')}else setDestination(parsed.destination)}
     }
     const routeKey=[parsed.pickup,parsed.destination,parsed.confidence].join('|');
     if(parsed.pickup&&parsed.destination&&routeKey!==lastTracked.current){lastTracked.current=routeKey;track('task route detected',{confidence:parsed.confidence})}
   },220);
   return()=>window.clearTimeout(timer)
 },[description,title,when,timingApplied]);

 useEffect(()=>{
   let live=true;
   if(!pickupId||!destinationId){setSuggestion(null);return()=>{}}
   const timer=window.setTimeout(async()=>{
     const r=await fetch('/api/tasks/suggestions?pickup_id='+encodeURIComponent(pickupId)+'&destination_id='+encodeURIComponent(destinationId),{cache:'no-store'});
     if(!r.ok)return;
     const j=await r.json();
     if(live)setSuggestion(j.suggestion||null);
   },180);
   return()=>{live=false;window.clearTimeout(timer)}
 },[pickupId,destinationId]);

 const chooseTemplate=(name:string,desc:string)=>{setTemplate(name);if(!title&&!touched.current.title)setTitle(name==='Food'?'Pick up food':'Carry out a task');if(!description)setDescription(desc)};
 const pick=(place:PlaceSuggestion)=>{touched.current.pickup=true;setPickup(place.label);setPickupId(place.locationId);setPickupKind(place.merchant?place.merchant.category:place.kind);setPickupMerchant(place.merchant||undefined);if(!title&&!touched.current.title)setTitle('Pick up from '+place.label)};
 const drop=(place:PlaceSuggestion)=>{touched.current.destination=true;setDestination(place.label);setDestinationId(place.locationId);setDestinationKind(place.merchant?place.merchant.category:place.kind);if(place.kind==='Hostel')setMode('HOSTEL')};
 const changePickup=(value:string)=>{touched.current.pickup=true;setPickup(value);setPickupId(null);setPickupKind('');setPickupMerchant(undefined)};
 const changeDestination=(value:string)=>{touched.current.destination=true;setDestination(value);setDestinationId(null);setDestinationKind('')};
 const applyDetected=()=>{if(!understanding?.pickup&&!understanding?.destination)return;const confidence=understanding.confidence;if(understanding.pickup&&!touched.current.pickup)setPickup(understanding.pickup);if(understanding.destination&&!touched.current.destination)setDestination(understanding.destination);track('task route applied',{confidence:confidence});};
 const swapLocations=()=>{touched.current.pickup=true;touched.current.destination=true;const p=pickup,d=destination,pk=pickupKind,dk=destinationKind,pi=pickupId,di=destinationId,pm=pickupMerchant;setPickup(d);setDestination(p);setPickupKind(dk);setDestinationKind(pk);setPickupId(di);setDestinationId(pi);setPickupMerchant(undefined);}
 const applySuggestion=()=>{if(!suggestion)return;setFee(String(Math.round(Number(suggestion.suggested_fee_kobo||0)/100)));setEta(String(suggestion.suggested_eta_minutes||30));track('route suggestion applied',{sampleCount:suggestion.sample_count})};
 async function submit(){
  setBusy(true);setError('');
  const r=await fetch('/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
   title:title||'Task request',description,pickup_location_text:pickup,destination_location_text:destination,
   estimated_item_cost_kobo:Math.max(0,Math.round(Number(itemCost||0)*100)),
   proposed_runner_fee_kobo:Math.max(0,Math.round(Number(fee||0)*100)),
   proposed_eta_minutes:Number(eta||30),delivery_mode:mode,delivery_room:room,scheduled_for:when||null,
   item_name:itemName||undefined,quantity:Number(quantity||1),pickup_location_id:pickupId,destination_location_id:destinationId,
   category:understanding?.category||'OTHER'
  })});
  const j=await r.json();setBusy(false);if(r.status===401){setReady(false);return}if(!r.ok){setError(j.error||'Could not post this task.');return}router.push('/orders/'+j.task.id);
 }
 if(!ready)return <AppShell><main className="shell app-page narrow"><div className="card form"><h2>Sign in to use CarryGo.</h2><p className="sub">Your wallet, streaks and task history live on your account.</p><Link className="btn dark" href="/login">Sign in →</Link></div></main></AppShell>;
 return <AppShell><main className="shell app-page narrow">
  <div className="page-top"><div><div className="eyebrow">NEW TASK</div><h1 className="app-title">Tell us what needs doing.</h1><p className="sub">Say it normally. CarryGo will pull out the details that matter.</p></div></div>
  {late&&<div className="late-banner"><strong>Hostel delivery only right now.</strong><span>From 10 PM to 5 AM, new jobs must end at a hostel or room.</span></div>}
  <div className="template-row">{templates.map(([a,b,c])=><button type="button" key={a} className={template===a?'mini-choice active':'mini-choice'} onClick={()=>chooseTemplate(a,c)}><small>{a}</small><span>{b}</span></button>)}</div>
  <div className="card form task-form">
   <label>What exactly should happen?<textarea value={description} onChange={e=>{setDescription(e.target.value);setError('')}} placeholder="Get 2 bottles of water from Green Plaza and bring them to Portfolio 214."/></label>
   {understanding&&<div className="understanding-strip" aria-live="polite"><span className="section-label">UNDERSTOOD</span>{understanding.quantity&&understanding.item&&<b>{understanding.quantity} × {understanding.item}</b>}{understanding.pickup&&understanding.destination&&<b>{pickup||understanding.pickup} → {destination||understanding.destination}</b>}{understanding.timingText&&<span>{understanding.timingText}</span>}{understanding.deliveryType&&<span>{understanding.deliveryType==='ROOM'?'Room':understanding.deliveryType==='HOSTEL'?'Hostel':'Meet-up'}</span>}{understanding.timingText&&timingToLocalInput(understanding.timingText)&&<button type="button" className="text-link" onClick={()=>{const local=timingToLocalInput(understanding.timingText);if(local){setWhen(local);setTimingApplied(true)}}}>Use timing</button>}</div>}
   {understanding?.pickup&&understanding?.destination&&<div className="smart-route" role="status"><div><Icon name="map" size={16}/><span><b>We spotted the route</b><small>{pickup||understanding.pickup} → {destination||understanding.destination}</small></span></div><button type="button" className="text-link" onClick={applyDetected}>Use this route</button></div>}
   <div className="grid2">
    <LocationField label="Pick up from" value={pickup} onChange={changePickup} onSelect={pick} placeholder="Omega, Green Plaza, ICT…"/>
    <div className="destination-wrap"><LocationField label="Bring it to" value={destination} onChange={changeDestination} onSelect={drop} placeholder="Portfolio Hostel, Senate…"/><button type="button" className="swap-locations" onClick={swapLocations} aria-label="Swap pickup and destination"><Icon name="swap" size={14}/></button></div>
   </div>
   <div className="micro-row">{pickupKind&&<span>Pickup · {pickupKind}</span>}{destinationKind&&<span>Drop · {destinationKind}</span>}{understanding?.category==='BUY_AND_BRING'&&<span>Buying task</span>}<span>Route can be edited before posting.</span></div>{pickupMerchant&&<div className="merchant-awareness"><b>{pickupMerchant.name}</b><span>{pickupMerchant.category} · known campus place</span>{pickupMerchant.averagePrepMinutes&&<small>Typical prep ~{pickupMerchant.averagePrepMinutes} min</small>}</div>}
   {(understanding?.item||understanding?.quantity)&&<div className="grid2 compact-structure"><label>Item<input value={itemName} onChange={e=>{touched.current.item=true;setItemName(e.target.value)}} placeholder="Water"/></label><label>Quantity<input inputMode="decimal" value={quantity} onChange={e=>{touched.current.quantity=true;setQuantity(e.target.value)}} placeholder="1"/></label></div>}
   {suggestion&&<div className="route-suggestion"><div><b>Based on {suggestion.sample_count} completed campus routes</b><span>Around {suggestion.suggested_eta_minutes} min · {suggestion.suggested_fee_kobo?('₦'+(Number(suggestion.suggested_fee_kobo)/100).toLocaleString('en-NG')):'fee unavailable'}</span></div><button type="button" className="text-link" onClick={applySuggestion}>Use this starting point</button></div>}
   <div className="grid3"><label>Item estimate<input inputMode="numeric" value={itemCost} onChange={e=>setItemCost(e.target.value)} placeholder="2500"/></label><label>Opening runner fee<input inputMode="numeric" value={fee} onChange={e=>setFee(e.target.value)} placeholder="500"/></label><label>ETA offered<input inputMode="numeric" value={eta} onChange={e=>setEta(e.target.value)} placeholder="30"/></label></div>
   <div className="grid2"><label>Bring it when<input type="datetime-local" value={when} onChange={e=>{setWhen(e.target.value);setTimingApplied(true)}}/><small className="hint">Blank = as soon as possible.</small></label><div className="summary-hint"><b>Price + time are negotiable.</b><span>Runners can counter both before you fund.</span></div></div>
   <label>Delivery type</label><div className="choice-grid">{[['LANDMARK','Meet-up','A point you choose'],['HOSTEL','Hostel','Any eligible runner'],['ROOM','Room','Same gender · higher fee']].map(([v,t,d])=><button type="button" key={v} onClick={()=>{touched.current.mode=true;if(v==='LANDMARK'&&late){setError('Meet-up delivery is unavailable after 10 PM.');return}setMode(v as any)}} className={mode===v?'choice on':'choice'} disabled={v==='LANDMARK'&&late}><b>{t}</b><span>{late&&v==='LANDMARK'?'Available from 5 AM':d}</span></button>)}</div>
   {mode==='ROOM'&&<><label>Room<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="214"/></label><div className="note">Room delivery is always same-gender. The room premium goes to runner compensation.</div></>}
   {error&&<div className="error" role="alert">{error}</div>}
   <button className="btn dark full sticky-submit" disabled={busy||!description||!pickup||!destination||!fee} onClick={submit}>{busy?'Posting…':'Post task →'}</button>
  </div>
 </main></AppShell>
}
