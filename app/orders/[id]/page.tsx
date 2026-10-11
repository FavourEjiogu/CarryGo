'use client';
import{useCallback,useEffect,useRef,useState}from'react';import{useParams,useRouter}from'next/navigation';import Link from'next/link';import{AppShell}from'@/src/components/AppShell';import{naira}from'@/src/lib/app-config';import{readLocationQueue,queueLocation,removeQueued,clearLocationQueue}from'@/src/lib/offline-queue';import{DeliveryRouteMap}from'@/components/ui/delivery-route-map';import{downloadCarryGoStatusCard}from'@/src/lib/share-card';import{estimateArrival}from'@/src/lib/delivery-tracking';
const flow=['FUNDED','IN_PROGRESS','AT_VENDOR','PRICE_ADJUSTMENT_PENDING','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING','COMPLETED'];
const terminal=new Set(['COMPLETED','CANCELLED','EXPIRED','FAILED','DISPUTED','ABANDONED']);
function pct(value:any){const n=Number(value||0);return n<=1?Math.round(n*100):Math.round(n)}
function verificationScore(value:string){return value==='UNIVERSITY_VERIFIED'?4:value==='CAMPUS_VERIFIED'?3:value==='PHONE_VERIFIED'?2:1}
function offerScore(b:any){const r=b.reputation||{};return pct(r.reliability_score)*0.38+pct(r.on_time_rate)*0.24+pct(r.completion_rate)*0.18+verificationScore(b.runner?.verification_level||'UNVERIFIED')*5+Math.max(0,100-Math.min(100,Number(b.fee_kobo||0)/10))*0.05+Math.max(0,100-Math.min(100,Number(b.eta_minutes||60)))*0.1}
function actionFor(status:string,payer:boolean,runner:boolean){if(payer){if(status==='OPEN'||status==='NEGOTIATING')return['Choose a runner','Compare the offers below before you commit.'];if(status==='AGREED')return['Fund the task','The runner is selected. Nothing starts until you fund it.'];if(status==='FUNDED')return['Your runner is getting ready','You can watch the task here as execution begins.'];if(status==='IN_PROGRESS')return['Runner is on the way to pickup','No action yet. Keep the chat nearby if pickup details change.'];if(status==='AT_VENDOR')return['Runner is checking the item','You will be asked only if the item price changes.'];if(status==='PRICE_ADJUSTMENT_PENDING')return['Review the price change','Approve or decline the difference before anything is charged.'];if(status==='ITEM_CONFIRMED')return['Your item is secured','The runner is moving it to the destination.'];if(status==='EN_ROUTE')return['Delivery is moving','Share the live status when someone else needs the update.'];if(status==='HANDOFF_PENDING')return['Be ready for handoff','Only reveal the handoff code when the runner is physically there.'];if(status==='COMPLETED')return['Task complete','Need the same thing again? Repeat the useful parts in one tap.']}if(runner){if(status==='AGREED')return['Wait for funding','The task details are fixed. Start only after funding lands.'];if(status==='FUNDED')return['Start the task','Once you are ready, mark the task in progress.'];if(status==='IN_PROGRESS')return['Go to pickup','Mark At pickup once you are with the vendor or pickup point.'];if(status==='AT_VENDOR')return['Confirm the item','Once the requested item is secured, continue the task.'];if(status==='ITEM_CONFIRMED')return['Head to destination','Mark En route when you leave pickup.'];if(status==='EN_ROUTE')return['Complete the handoff','Mark Handoff pending when you are at the destination.'];if(status==='HANDOFF_PENDING')return['Verify handoff','Enter the customer code to complete the task.'];if(status==='COMPLETED')return['Task complete','This route is now part of your reliability history.']};return['Task status','CarryGo will surface the next useful action here.']}
export default function Order(){const{id}=useParams<{id:string}>();const router=useRouter();const[t,setT]=useState<any>(null),[viewer,setViewer]=useState(''),[bids,setBids]=useState<any[]>([]),[items,setItems]=useState<any[]>([]),[messages,setMessages]=useState<any[]>([]),[body,setBody]=useState(''),[messageBusy,setMessageBusy]=useState(false),[error,setError]=useState(''),[trackOn,setTrackOn]=useState(false),[tracking,setTracking]=useState<any>(null),[adjustments,setAdjustments]=useState<any[]>([]),[newCost,setNewCost]=useState(''),[reason,setReason]=useState(''),[receipt,setReceipt]=useState<File|null>(null),[pin,setPin]=useState(''),[handoff,setHandoff]=useState<any>(null),[handoffPin,setHandoffPin]=useState(''),[busy,setBusy]=useState(false),[shareBusy,setShareBusy]=useState(false),[shareUrl,setShareUrl]=useState(''),[sort,setSort]=useState<'fit'|'fee'|'eta'>('fit'),[replyTo,setReplyTo]=useState<any|null>(null),[peerTyping,setPeerTyping]=useState(false),[locationConsentOpen,setLocationConsentOpen]=useState(false);
 const locationSharingAllowed=Boolean(t&&['IN_PROGRESS','AT_VENDOR','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING'].includes(t.status));const[networkOnline,setNetworkOnline]=useState(true);useEffect(()=>{const sync=()=>setNetworkOnline(navigator.onLine);const timer=window.setTimeout(sync,0);window.addEventListener('online',sync);window.addEventListener('offline',sync);return()=>{window.clearTimeout(timer);window.removeEventListener('online',sync);window.removeEventListener('offline',sync)}},[]);useEffect(()=>{if(t&&!locationSharingAllowed)clearLocationQueue(id)},[id,t,locationSharingAllowed]);
 const loadInFlight=useRef(false),loadControllerRef=useRef<AbortController|null>(null);
 const load=useCallback(async(force=false)=>{
  if(loadInFlight.current){if(!force)return;loadControllerRef.current?.abort();loadControllerRef.current=null;loadInFlight.current=false}
  loadInFlight.current=true;
  const controller=new AbortController();
  loadControllerRef.current=controller;
  try{
   const r=await fetch('/api/tasks/'+id,{cache:'no-store',signal:controller.signal});
   const a=await r.json().catch(()=>({}));
   if(!r.ok){setError(a.error||'Could not load this task.');return}
   if(!a.task){setError('Task response was incomplete. Refresh this page to retry.');return}
   setT({...a.task,route_points:a.route_points||[],agreement:a.agreement||null});
   setViewer(a.viewer_id||'');setBids(a.bids||[]);setItems(a.items||[]);setMessages(a.messages||[]);setTracking(a.tracking||{session:null});setAdjustments(a.adjustments||[]);setHandoff(a.handoff||null);
  }catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))setError('Connection interrupted. CarryGo will retry when the network is available.')}
  finally{if(loadControllerRef.current===controller){loadControllerRef.current=null;loadInFlight.current=false}}
 },[id]);
 useEffect(()=>{
  let cancelled=false;let timer=0;
  const schedule=()=>{if(cancelled)return;window.clearTimeout(timer);timer=window.setTimeout(async()=>{if(!document.hidden)await load(true);schedule()},document.hidden?45000:8000)};
  const visibility=()=>{if(document.visibilityState==='visible'){window.clearTimeout(timer);void load().finally(schedule)}};
  void load().finally(schedule);
  document.addEventListener('visibilitychange',visibility);
  return()=>{cancelled=true;window.clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);loadControllerRef.current?.abort()};
 },[load]);
 useEffect(()=>{
  let cancelled=false;let timer=0;let inFlight=false;
  const poll=async()=>{if(cancelled)return;if(!document.hidden&&!inFlight){inFlight=true;try{const r=await fetch('/api/tasks/'+id+'/presence',{cache:'no-store'});const j=r.ok?await r.json().catch(()=>null):null;if(j)setPeerTyping(Boolean(j.typing))}catch{}finally{inFlight=false}}if(!cancelled)timer=window.setTimeout(poll,document.hidden?45000:4500)};
  const visibility=()=>{if(document.visibilityState==='visible'){window.clearTimeout(timer);void poll()}};
  void poll();document.addEventListener('visibilitychange',visibility);
  return()=>{cancelled=true;window.clearTimeout(timer);document.removeEventListener('visibilitychange',visibility)};
 },[id]);
 useEffect(()=>{
  const active=body.trim().length>0;
  const publish=(value:boolean)=>fetch('/api/tasks/'+id+'/presence',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({is_typing:value})}).catch(()=>{});
  const timer=window.setTimeout(()=>publish(active),active?350:250);
  const idle=active?window.setTimeout(()=>publish(false),2500):null;
  return()=>{window.clearTimeout(timer);if(idle)window.clearTimeout(idle)};
 },[body,id]);
 useEffect(()=>{
  if(!trackOn||!locationSharingAllowed)return;
  if(!navigator.geolocation){setError('This device does not provide location services. You can still follow delivery status and use handoff verification.');setTrackOn(false);return}
  let active=true;let seq=Date.now()-1;
  try{const stored=Number(localStorage.getItem('cg:seq:'+id)||0);seq=Number.isSafeInteger(stored)&&stored>0?Math.max(stored,Date.now()-1):Date.now()-1}catch{}
  const enqueue=(payload:{taskId:string;latitude:number;longitude:number;accuracy_m:number;captured_at:string;sequence:number})=>{
   try{queueLocation(payload)}catch{setError('This browser could not save a pending location update. Keep CarryGo open while online.')}
  };
  const dequeue=(sequence:number)=>{try{removeQueued(id,sequence)}catch{setError('A stored GPS update could not be removed from this device. Clear offline data in You → Privacy if this repeats.')}};
  const deliver=async(payload:{taskId:string;latitude:number;longitude:number;accuracy_m:number;captured_at:string;sequence:number})=>{
   try{
    const response=await fetch('/api/tasks/'+id+'/location',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(response.status>=500||response.status===429)throw new Error('temporary');
    if(response.status===401||response.status===403){dequeue(payload.sequence);setError(result.error||'Location sharing is no longer authorized for this task.');setTrackOn(false);return}
    if(response.ok||response.status<500)dequeue(payload.sequence);
   }catch{enqueue(payload)}
  };
  const send=(position:GeolocationPosition)=>{
   if(!active)return;
   seq=Math.max(seq+1,Date.now());
   try{localStorage.setItem('cg:seq:'+id,String(seq))}catch{}
   if(!Number.isFinite(position.coords.accuracy)||position.coords.accuracy<0||position.coords.accuracy>10000){setError('GPS accuracy is too low to share a reliable location. Move to a clearer area and try again.');return}
   const capturedAt=Number.isFinite(position.timestamp)?new Date(position.timestamp).toISOString():new Date().toISOString();
   const payload={taskId:id,latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy_m:position.coords.accuracy,captured_at:capturedAt,sequence:seq};
   if(navigator.onLine)void deliver(payload);else enqueue(payload);
  };
  const locationError=(cause:GeolocationPositionError)=>{
   if(!active)return;
   if(cause.code===1){clearLocationQueue(id);setError('Location permission was denied. Live GPS is off; chat and handoff verification still work.');setTrackOn(false)}
   else if(cause.code===2)setError('Your device could not determine a location. Check GPS settings; delivery status and chat still work.');
   else setError('Location lookup timed out. Keep sharing enabled and CarryGo will try again.');
  };
  const watch=navigator.geolocation.watchPosition(send,locationError,{enableHighAccuracy:false,maximumAge:30000,timeout:15000});
  const flushQueue=()=>{
   if(!active||!navigator.onLine)return;
   let queued:{taskId:string;latitude:number;longitude:number;accuracy_m:number;captured_at:string;sequence:number}[]=[];
   try{queued=readLocationQueue().filter(item=>item.taskId===id)}catch{setError('Could not read pending location updates from this browser.');return}
   if(!queued.length)return;
   // GPS samples are live operational data, not a trip diary. Keep only the newest queued coordinate.
   queued.sort((a,b)=>Date.parse(b.captured_at)-Date.parse(a.captured_at));
   const newest=queued[0];
   for(const older of queued.slice(1))dequeue(older.sequence);
   const age=Date.now()-Date.parse(newest.captured_at);
   if(Number.isFinite(age)&&age>=-30000&&age<=30000)void deliver(newest);
   else dequeue(newest.sequence);
  };
  const retry=window.setInterval(flushQueue,60000);
  const onOnline=()=>flushQueue();
  window.addEventListener('online',onOnline);
  return()=>{active=false;navigator.geolocation.clearWatch(watch);window.clearInterval(retry);window.removeEventListener('online',onOnline)};
 },[id,trackOn,locationSharingAllowed]);
 async function msg(){const x=body.trim();if(!x||messageBusy)return;setMessageBusy(true);try{const r=await fetch('/api/tasks/'+id+'/messages',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({body:x.slice(0,1000),reply_to_message_id:replyTo?.id||null})}),j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||'Message failed.');return}if(j.message){setMessages(v=>[...v,{...j.message,reply_to:replyTo?{id:replyTo.id,sender_id:replyTo.sender_id,body:replyTo.body}:null}])}setBody('');setReplyTo(null);fetch('/api/tasks/'+id+'/presence',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({is_typing:false})}).catch(()=>{})}catch{setError('Message could not be sent. Check your connection and try again.')}finally{setMessageBusy(false)}}
 async function advance(s:string){if(busy)return;setBusy(true);try{const r=await fetch('/api/tasks/'+id+'/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({next_status:s})}),j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||'Could not update status.');return}await load()}catch{setError('Status update failed. Check your connection and retry.')}finally{setBusy(false)}}
 async function accept(bid:string){if(busy)return;setBusy(true);try{const r=await fetch('/api/tasks/'+id+'/accept',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bid_id:bid})}),j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||'Could not accept offer.');return}if(typeof j.redirect==='string')router.push(j.redirect);else{setError('The accepted offer was saved, but CarryGo could not open the next screen. Refresh task status.');await load()}}catch{setError('Could not accept the offer. Check your connection and retry.')}finally{setBusy(false)}}
 async function requestAdjustment(){if(busy)return;const numericCost=Number(newCost);const amount=Math.round(numericCost*100);if(!Number.isFinite(numericCost)||numericCost<=0||!Number.isSafeInteger(amount)){setError('Enter a valid item total greater than ₦0.');return}if(!reason.trim()||reason.trim().length>300){setError('Add a reason of no more than 300 characters.');return}if(receipt&&(!['image/jpeg','image/png','image/webp'].includes(receipt.type)||receipt.size>3*1024*1024)){setError('Receipt must be a JPEG, PNG or WebP image under 3 MB.');return}setBusy(true);try{const form=new FormData();form.set('new_item_cost_kobo',String(amount));form.set('reason',reason.trim());if(receipt)form.set('receipt',receipt);const r=await fetch('/api/tasks/'+id+'/price-adjustment',{method:'POST',body:form}),j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||'Could not request adjustment.');return}setNewCost('');setReason('');setReceipt(null);await load()}catch{setError('Price approval could not be requested. Check your connection and retry.')}finally{setBusy(false)}}
 async function decision(action:string,adjustmentId:string){
  if(busy||!['approve','reject'].includes(action))return;
  setBusy(true);
  try{
   const r=await fetch('/api/tasks/'+id+'/price-adjustment',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({action,adjustment_id:adjustmentId})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){setError(j.error||'Could not update adjustment.');return}
   await load(true);
  }catch{setError('Could not update the price decision. Check your connection and retry.')}
  finally{setBusy(false)}
 }
 async function rotate(){
  if(busy)return;
  setBusy(true);
  try{
   const r=await fetch('/api/tasks/'+id+'/handoff',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'rotate'})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){setError(j.error||'Could not create a handoff code.');return}
   if(typeof j.pin==='string'&&/^\\d{6}$/.test(j.pin))setHandoffPin(j.pin);
   else{setError('CarryGo did not return a valid handoff code. Refresh the task and try again.');await load(true)}
  }catch{setError('Could not create a handoff code. Check your connection and retry.')}
  finally{setBusy(false)}
 }
 async function verify(){if(busy||pin.length!==6)return;setBusy(true);try{const r=await fetch('/api/tasks/'+id+'/handoff',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'verify',pin})}),j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||'Could not verify handoff.');return}setPin('');await load(true)}catch{setError('Handoff verification failed. Check your connection and retry.')}finally{setBusy(false)}}
 async function retryVariance(adjustmentId:string){
  if(busy)return;
  setBusy(true);
  try{
   const r=await fetch('/api/tasks/'+id+'/price-adjustment/fund',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({adjustment_id:adjustmentId})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){setError(j.error||'Could not fund variance.');return}
   await load(true);
  }catch{setError('Could not fund the approved difference. Check your connection and retry.')}
  finally{setBusy(false)}
 }
 async function repeat(){if(busy)return;setBusy(true);try{const r=await fetch('/api/tasks/'+id+'/repeat',{method:'POST'}),j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||'Could not repeat this task.');return}if(j.task?.id)router.push('/orders/'+j.task.id);else setError('CarryGo could not open the repeated task. Refresh Orders.')}catch{setError('Could not repeat this task. Check your connection and retry.')}finally{setBusy(false)}}
 async function cancelTask(){
  if(busy||!window.confirm('Cancel this task?'))return;
  setBusy(true);
  try{
   const r=await fetch('/api/tasks/'+id+'/cancel',{method:'POST'});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){setError(j.error||'Could not cancel.');return}
   await load(true);
  }catch{setError('Could not cancel this task. Check your connection and retry.')}
  finally{setBusy(false)}
 }
 async function ensureShareUrl():Promise<string|null>{
  if(shareUrl)return shareUrl;
  setShareBusy(true);
  try{
    const r=await fetch('/api/tasks/'+id+'/share',{method:'POST'});
    const j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not create a status link.');
    const url=new URL(j.url,window.location.origin).toString();
    setShareUrl(url);
    return url;
  }catch(e){setError(e instanceof Error?e.message:'Could not create a status link.');return null}
  finally{setShareBusy(false)}
}
async function shareStatus(){
  const url=await ensureShareUrl();if(!url)return;
  try{await navigator.clipboard.writeText(url)}catch{setError('The link is ready below, but your browser did not allow automatic copying.')}
}
async function downloadStatusCard(){
  const url=await ensureShareUrl();if(!url)return;
  try{
    await downloadCarryGoStatusCard({
      title:'Delivery update',
      status:t.status,
      pickup:'Pickup details stay private',
      destination:'Drop-off details stay private',
      url,
    });
  }catch(e){setError(e instanceof Error?e.message:'Could not download the branded image.')}
}
 if(!t)return <AppShell><main className="shell app-page"><div className="card form"><h2>Loading task…</h2></div></main></AppShell>;
 const idx=flow.indexOf(t.status),latest=adjustments[0],payer=t.payer_id===viewer,runner=t.runner_id===viewer;
 const action=actionFor(t.status,payer,runner);
 const sortedBids=[...bids].sort((a,b)=>sort==='fee'?Number(a.fee_kobo)-Number(b.fee_kobo):sort==='eta'?Number(a.eta_minutes)-Number(b.eta_minutes):offerScore(b)-offerScore(a));
 const nextRunnerStatus=t.status==='FUNDED'?'IN_PROGRESS':t.status==='IN_PROGRESS'?'AT_VENDOR':t.status==='AT_VENDOR'?'ITEM_CONFIRMED':t.status==='ITEM_CONFIRMED'?'EN_ROUTE':t.status==='EN_ROUTE'?'HANDOFF_PENDING':null;
 const routePoints=t.route_points||[];const pickupPoint=routePoints.find((point:any)=>point.id===t.pickup_location_id)||null;const destinationPoint=routePoints.find((point:any)=>point.id===t.destination_location_id)||null;const etaMinutes=t.agreement?.agreed_eta_minutes??t.proposed_eta_minutes;const arrivalEstimate=estimateArrival(t.started_at,etaMinutes);const arrivalLabel=arrivalEstimate?(arrivalEstimate.getTime()<Date.now()?'Agreed ETA window has passed':'Expected around '+new Intl.DateTimeFormat('en-NG',{hour:'numeric',minute:'2-digit'}).format(arrivalEstimate)):null;
 return <AppShell><main className="shell app-page">
  <>{!networkOnline&&<div className="task-connectivity" role="status"><strong>You're offline.</strong> Updates may be delayed. GPS points will only retry while they're still fresh.</div>}</><div className="page-top"><div><div className="eyebrow">TASK · {t.status.replaceAll('_',' ')}</div><h1 className="app-title">{t.title}</h1><p className="sub">{t.pickup_location_text} → {t.destination_location_text}{t.delivery_mode==='ROOM'?' · same-gender room':''}</p></div><Link className="btn ghost" href="/orders">Orders</Link></div>
  {error&&<div className="error" role="alert">{error}</div>}
  <section className="card next-action"><div><small>DO THIS NOW</small><h2>{action[0]}</h2><p className="sub">{action[1]}</p></div>{payer&&t.status==='AGREED'&&<Link className="btn dark" href={'/fund/'+id}>Fund task →</Link>}{runner&&nextRunnerStatus&&<button type="button" className="btn dark" disabled={busy} onClick={()=>advance(nextRunnerStatus)}>{busy?'Updating…':nextRunnerStatus==='HANDOFF_PENDING'?'At destination →':nextRunnerStatus==='ITEM_CONFIRMED'?'Item secured →':nextRunnerStatus==='EN_ROUTE'?'Start delivery →':nextRunnerStatus==='AT_VENDOR'?'At pickup →':'Start task →'}</button>}{payer&&t.status==='COMPLETED'&&<button type="button" className="btn dark" disabled={busy} onClick={repeat}>{busy?'Creating…':'Do this again →'}</button>}</section>
  {items.length>0&&<div className="task-detail-strip"><span>ITEM</span><b>{items.map(x=>String(x.quantity)+' × '+x.name).join(' · ')}</b></div>}
  <div className="track-grid card"><DeliveryRouteMap pickupText={t.pickup_location_text||'Pickup'} destinationText={t.destination_location_text||'Drop-off'} pickupPoint={pickupPoint} destinationPoint={destinationPoint} deliveryStatus={t.status} runnerLabel={runner?'Your shared location · GPS':'Runner · GPS'} payerLabel={payer?'Your shared location · GPS':'Requester · GPS'} runnerLocation={{latitude:tracking?.session?.last_runner_lat,longitude:tracking?.session?.last_runner_lng,updatedAt:tracking?.session?.last_runner_at}} payerLocation={{latitude:tracking?.session?.last_payer_lat,longitude:tracking?.session?.last_payer_lng,updatedAt:tracking?.session?.last_payer_at}}/><div className="track-side"><small>DELIVERY STATUS</small><b>{t.status.replaceAll('_',' ')}</b>{arrivalLabel&&['IN_PROGRESS','AT_VENDOR','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING'].includes(t.status)&&<div className="delivery-eta-card"><small>AGREED ETA · ESTIMATE</small><strong>{arrivalLabel}</strong><span>Based on the agreed duration, not traffic-aware road routing.</span></div>}<span>{tracking?.session?.last_runner_at?'Last runner update '+new Intl.DateTimeFormat('en-NG',{hour:'numeric',minute:'2-digit'}).format(new Date(tracking.session.last_runner_at)):'Waiting for runner GPS'}</span><button type="button" className={'btn '+(trackOn?'lime':'ghost')} onClick={()=>{if(trackOn){clearLocationQueue(id);setTrackOn(false);setLocationConsentOpen(false)}else if(locationSharingAllowed){setLocationConsentOpen(true)}}} disabled={!locationSharingAllowed} aria-pressed={trackOn&&locationSharingAllowed}>{locationSharingAllowed?(trackOn?'Stop sharing location':'Share my location'):'Location sharing unavailable'}</button>{locationConsentOpen&&locationSharingAllowed&&!trackOn&&<div className="location-share-consent" aria-labelledby="location-share-title"><strong id="location-share-title">Share live GPS for this task?</strong><p>Your device will send location updates while this task is active and sharing is on. The other task participant can see the shared location on the map. You can stop sharing at any time; CarryGo does not need GPS for chat or handoff verification.</p><div className="location-share-actions"><button type="button" className="btn ghost" onClick={()=>setLocationConsentOpen(false)}>Not now</button><button type="button" className="btn dark" onClick={()=>{setLocationConsentOpen(false);setTrackOn(true)}}>Allow location sharing</button></div></div>}{!locationSharingAllowed&&<small>Live location sharing is only available while a delivery is active.</small>}{!terminal.has(t.status)&&<><button type="button" className="btn ghost" disabled={shareBusy} onClick={()=>void shareStatus()}>{shareBusy?'Creating link…':'Share live status'}</button><button type="button" className="btn lime" disabled={shareBusy} onClick={()=>void downloadStatusCard()}>{shareBusy?'Preparing…':'Download branded image'}</button></>}{shareUrl&&<><a className="share-confirm" href={shareUrl} target="_blank" rel="noreferrer">Open live status link ↗</a><small>Share link expires in 2 hours. The image includes CarryGo branding and this link.</small></>}{trackOn&&<small role="status">{networkOnline?'Live location sharing is on for this task. Stop it here any time.':'You are offline. Recent location updates are queued for retry after reconnecting.'}</small>}<small>Shared status shows only this delivery, not your account or location history. Room addresses are omitted from downloaded cards.</small></div></div>
  <details className="workflow-details"><summary>See full delivery flow</summary><div className="timeline" role="list" aria-label="Task progress">{flow.map((s,i)=><div role="listitem" key={s} className={i<=idx?'on':''} aria-current={s===t.status?'step':undefined}><small>{i+1}</small><b>{s.replaceAll('_',' ')}</b></div>)}</div></details>
  {(t.status==='OPEN'||t.status==='NEGOTIATING')&&<section className="section-tight"><div className="section-label"><span>OFFERS</span><span>{bids.length} active</span></div><div className="offer-sort"><button className={sort==='fit'?'filter active':'filter'} onClick={()=>setSort('fit')}>Best fit</button><button className={sort==='fee'?'filter active':'filter'} onClick={()=>setSort('fee')}>Lowest fee</button><button className={sort==='eta'?'filter active':'filter'} onClick={()=>setSort('eta')}>Fastest</button></div><div className="task-list">{sortedBids.map(b=><article className="card task offer-card" key={b.id}><div><b>{b.runner?.display_name||'Runner'}</b><div className="offer-trust"><span>{b.runner?.verification_level?.replaceAll('_',' ')||'Not verified'}</span><span>{b.reputation?.total_completed||0} completed</span><span>{pct(b.reputation?.on_time_rate||0)}% on time</span><span>{b.reputation?.trust_band||'Building history'}</span></div><span>{b.message||'No message'} · {b.eta_minutes} min · float {naira(b.runner_float_capacity_kobo)}</span></div><div className="task-action"><strong>{naira(b.fee_kobo)}</strong>{payer&&<button type="button" className="btn dark" disabled={busy} onClick={()=>accept(b.id)}>{busy?'Please wait…':'Choose'}</button>}</div></article>)}</div>{sortedBids.length===0&&<div className="card offer-empty"><strong>No offers yet.</strong><p className="sub">CarryGo will refresh this list when a runner responds. You can leave this page open or come back from Orders.</p></div>}</section>}
  {t.status==='AGREED'&&payer&&<div className="card form"><div className="section-label"><span>AGREEMENT READY</span><span>Escrow next</span></div><p className="sub">The runner, fee and ETA are fixed for this agreement. Fund it before the runner can start.</p><Link className="btn dark full" href={'/fund/'+id}>Fund task →</Link></div>}
  {t.status==='AT_VENDOR'&&runner&&<section className="section-tight"><div className="card form"><div className="section-label"><span>PRICE GUARD</span><span>Nothing moves silently</span></div><h2>Actual price changed?</h2><p className="sub">Ask the customer to approve the new item cost. CarryGo will not increase the escrow without an explicit approval and top-up.</p><label>New total item cost<input inputMode="numeric" value={newCost} onChange={e=>setNewCost(e.target.value)} placeholder="e.g. 3200"/></label><label>Reason<input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Vendor price was higher"/></label><label>Receipt <span className="muted-inline">optional · JPEG, PNG or WebP · 3 MB max</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setReceipt(e.target.files?.[0]||null)}/></label>{receipt&&<small className="hint">Attached: {receipt.name}</small>}<button type="button" className="btn dark" disabled={busy||!newCost.trim()||!reason.trim()} onClick={requestAdjustment}>{busy?'Submitting…':'Request approval →'}</button></div></section>}
  {t.status==='PRICE_ADJUSTMENT_PENDING'&&latest&&<section className="section-tight"><div className="card form"><div className="section-label"><span>PRICE CHANGE</span><span>{naira(latest.variance_kobo)} more</span></div><h2>Customer approval needed.</h2><p className="sub">Runner says the item now costs {naira(latest.new_item_cost_kobo)} instead of {naira(latest.previous_item_cost_kobo)}.</p><p className="soft-note">{latest.reason}</p>{latest.evidence_url&&<a className="text-link" href={latest.evidence_url} target="_blank" rel="noreferrer">View receipt →</a>}{payer&&<div className="actions"><button type="button" className="btn dark" disabled={busy} onClick={()=>decision('approve',latest.id)}>Approve + fund →</button><button type="button" className="btn ghost" disabled={busy} onClick={()=>decision('reject',latest.id)}>Decline</button></div>}</div></section>}
  {latest?.status==='APPROVED'&&payer&&<section className="section-tight"><div className="card form"><div className="section-label"><span>TOP-UP REQUIRED</span><span>{naira(latest.variance_kobo)}</span></div><p className="sub">The approval is recorded. Fund only the difference from your wallet.</p><button type="button" className="btn dark" disabled={busy} onClick={()=>retryVariance(latest.id)}>Fund difference →</button></div></section>}
  {t.status==='HANDOFF_PENDING'&&<section className="section-tight"><div className="card form"><div className="section-label"><span>HANDOFF</span><span>PIN verified on completion</span></div>{payer&&<>{handoffPin?<div className="pin-display"><small>YOUR CURRENT CODE</small><strong>{handoffPin}</strong></div>:<button type="button" className="btn dark" disabled={busy} onClick={rotate}>Show a new handoff code</button>}<div className="soft-note">Give the code to the runner only when the delivery is in your hands.</div></>}{runner&&<><label>Enter customer handoff code<input className="pin-box" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6 digits"/></label><button type="button" className="btn lime" disabled={busy||pin.length!==6} onClick={verify}>Verify and complete →</button></>}</div></section>}
  {['OPEN','NEGOTIATING','AGREED','FUNDING','FUNDED'].includes(t.status)&&<button type="button" className="btn ghost" disabled={busy} onClick={cancelTask}>{busy?'Updating…':'Cancel task'}</button>}
  <section className="section-tight"><div className="section-label"><span>CHAT</span><span>Location questions belong here</span></div><div className="card chat"><div className="chat-list" aria-live="polite">{messages.map(m=>{const reply=()=>{setReplyTo(m);try{navigator.vibrate?.(8)}catch{}};return <div key={m.id} className={m.sender_id===viewer?'bubble me swipeable-message':'bubble swipeable-message'} onPointerDown={e=>{const el=e.currentTarget as HTMLElement;el.dataset.swipeX=String(e.clientX);el.style.transition='none';try{el.setPointerCapture(e.pointerId)}catch{}}} onPointerMove={e=>{const el=e.currentTarget as HTMLElement;const start=Number(el.dataset.swipeX||e.clientX);const dx=Math.max(0,Math.min(84,e.clientX-start));if(el.dataset.swipeX)el.style.transform=dx>0?'translateX('+dx+'px)':'';el.classList.toggle('swiping',dx>0)}} onPointerUp={e=>{const el=e.currentTarget as HTMLElement;const start=Number(el.dataset.swipeX||e.clientX);const dx=e.clientX-start;el.style.transition='';el.style.transform='';el.classList.remove('swiping');delete el.dataset.swipeX;if(dx>52)reply()}} onPointerCancel={e=>{const el=e.currentTarget as HTMLElement;el.style.transition='';el.style.transform='';el.classList.remove('swiping');delete el.dataset.swipeX}}><button type="button" className="message-reply-trigger" aria-label={"Reply to "+(m.sender_id===viewer?'your':'their')+" message"} onClick={reply}>↩</button>{m.reply_to&&<div className="reply-quote"><b>{m.reply_to.sender_id===viewer?'You':'Reply'}</b><span>{m.reply_to.body}</span></div>}<span>{m.body}</span><small>{new Date(m.created_at).toLocaleTimeString()}</small></div>})}</div>{peerTyping&&<div className="typing-cue" role="status" aria-live="polite"><i/><i/><i/><span>They’re replying…</span></div>}{replyTo&&<div className="reply-preview" aria-live="polite"><div><small>REPLYING TO</small><b>{replyTo.sender_id===viewer?'You':replyTo.body?.slice(0,80)}</b></div><button type="button" onClick={()=>setReplyTo(null)} aria-label="Cancel reply">×</button></div>}<div className="chat-compose"><input aria-label={replyTo?'Reply to message':'Message'} maxLength={1000} value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void msg()}}} placeholder={replyTo?'Write a reply…':'Confirm the exact pickup point…'}/><button type="button" className="btn dark" disabled={messageBusy||!body.trim()} onClick={()=>void msg()}>{messageBusy?'Sending…':replyTo?'Reply':'Send'}</button><small className="message-counter" aria-live="off">{body.length}/1000</small></div></div></section>
 </main></AppShell>
}
