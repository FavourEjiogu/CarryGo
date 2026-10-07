'use client';

import{useEffect,useMemo,useState}from'react';
import Link from'next/link';
import{motion}from'motion/react';
import{AppShell}from'@/src/components/AppShell';
import{Icon}from'@/src/components/icons';

type Dashboard={authenticated:boolean;profile?:{display_name?:string}|null;campus?:{name:string;city?:string|null;state?:string|null}|null;streak?:{current_weeks?:number;discount_percent?:number}|null;openTaskCount?:number;tasks?:Array<{id:string;title:string;status:string;pickup_location_text:string;destination_location_text:string}>;overnight_hostel_only?:boolean};

const signals=[['POST','Say what needs doing.'],['AGREE','Set the price + time.'],['MOVE','Watch it move.']] as const;

export default function Home(){
 const[d,setD]=useState<Dashboard|null>(null);
 useEffect(()=>{fetch('/api/dashboard',{cache:'no-store'}).then(async r=>r.status===401?{authenticated:false}:r.ok?r.json():{authenticated:false}).then(setD).catch(()=>setD({authenticated:false}))},[]);
 const first=useMemo(()=>d?.profile?.display_name?.trim().split(/\s+/)[0]||'there',[d]);
 const campusLabel=d?.campus?.name?(d.campus.city?d.campus.name+' · '+d.campus.city:d.campus.name):'your campus';
 const liveCount=d?.openTaskCount||0;
 const current=d?.tasks?.[0];

 return <AppShell><main className="shell app-page home-modern">
  <section className="home-hero">
   <div className="home-copy">
    <div className="eyebrow">{d?.authenticated?campusLabel.toUpperCase():'CAMPUS EXECUTION NETWORK'}</div>
    <h1>{d?.authenticated?<>Good to see you, <em>{first}.</em></>:<>Get things done.<br/><em>Move on.</em></>}</h1>
    <p className="home-lead">Food. Pickups. Printing. Groceries. Small jobs. Tell CarryGo what needs doing, then let people around you handle the rest.</p>
    <div className="home-cta"><Link href="/do" className="btn dark">I need something <Icon name="arrow" size={17}/></Link><Link href="/earn" className="btn ghost">I want to earn</Link></div>
    <div className="home-trust"><span><Icon name="shield" size={13}/> Protected funding</span><span><Icon name="clock" size={13}/> Price + time agreed first</span><span><Icon name="wifi" size={13}/> 2G-first</span></div>
   </div>

   <div className="home-orbit-card" aria-label="Live CarryGo network preview">
    <div className="orbit-glow"/>
    <motion.div className="float-card card-a" animate={{y:[0,-8,0],rotate:[0,1.5,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut'}}>
      <small>{current?'YOUR NEXT MOVE':'LIVE MARKET'}</small>
      <b>{current?current.title:(liveCount+' open request'+(liveCount===1?'':'s'))}</b>
      <span>{current?current.pickup_location_text+' → '+current.destination_location_text:(d?.overnight_hostel_only?'Hostel + room requests tonight':'Matched to this campus')}</span>
    </motion.div>
    <motion.div className="float-card card-b" animate={{y:[0,8,0],rotate:[0,-1.2,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut',delay:.3}}>
      <small>{d?.authenticated?'YOUR STREAK':'THE CARRYGO LOOP'}</small>
      <b>{d?.authenticated?((d.streak?.discount_percent||0)+'% banked'):'POST · AGREE · MOVE'}</b>
      <span>{d?.authenticated?((d.streak?.current_weeks||0)+' week streak · spend any part when you need it.'):'A simple loop built for campus life.'}</span>
    </motion.div>
    <div className="orbit-core"><i className="brand-dot"/><strong>CarryGo</strong><span>{d?.authenticated?campusLabel:'made for campus life'}</span></div>
    <motion.i className="orbit-pulse" animate={{scale:[1,1.35,1],opacity:[.35,.08,.35]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut'}} aria-hidden="true"/>
   </div>
  </section>

  <section className="home-flow" aria-label="How CarryGo works">
   {signals.map(([k,v],i)=><motion.div key={k} className="flow-step" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}><b>0{i+1}</b><span>{k}</span><p>{v}</p></motion.div>)}
  </section>

  {d?.authenticated&&<section className="home-grid">
   <div className="panel streak-panel">
    <div className="panel-head"><span>STREAK</span><Link href="/you">Open</Link></div>
    <div className="streak-number">{d.streak?.discount_percent||0}<small>% banked</small></div>
    <div className="streak-track"><span style={{width:Math.min(100,d.streak?.discount_percent||0)+'%'}}/></div>
    <p>{d.streak?.current_weeks||0} week streak. Your earned benefit stays yours.</p>
   </div>
   <div className="panel live-panel">
    <div className="panel-head"><span>LIVE MARKET</span><b>{liveCount}</b></div>
    <p>{liveCount?liveCount+' open request'+(liveCount===1?'':'s')+' on '+campusLabel+'.':'No open requests right now — a quiet market is still a good time to post.'}</p>
    <Link className="text-link" href="/earn">See what&apos;s moving →</Link>
   </div>
  </section>}

  {d?.tasks?.length? <section className="section-tight"><div className="section-label"><span>YOUR CURRENT TASKS</span><Link href="/orders">View all</Link></div><div className="task-list compact">{d.tasks.map(t=><Link href={'/orders/'+t.id} className="task-row" key={t.id}><div><b>{t.title}</b><span>{t.pickup_location_text} → {t.destination_location_text}</span></div><strong>{t.status.replaceAll('_',' ')}</strong></Link>)}</div></section>:null}

  {!d?.authenticated&&<section className="home-grid">
   <Link className="panel home-action-panel" href="/login"><div className="panel-head"><span>NEW HERE?</span><Icon name="arrow" size={16}/></div><h2>Start with your campus.</h2><p>Sign in, choose your school, then CarryGo adapts around the places and people you actually use.</p></Link>
   <Link className="panel home-action-panel purple-panel" href="/offline"><div className="panel-head"><span>LOW-DATA MODE</span><Icon name="wifi" size={16}/></div><h2>Useful when the network isn&apos;t.</h2><p>Typed places, compact updates and the cached app shell keep the core experience light.</p></Link>
  </section>}

  <section className="home-bottom"><div><small>BUILT FOR REAL NETWORKS</small><h2>Useful when the network isn&apos;t.</h2><p>CarryGo keeps the core loop light: typed places, compact updates, local retry and no map required to get an errand moving.</p></div><Link href="/offline" className="btn ghost">See low-data design</Link></section>
 </main></AppShell>
}