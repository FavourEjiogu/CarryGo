'use client';
import{useEffect,useState}from'react';import Link from'react/link';import{motion}from'motion/react';import{AppShell}from'@/src/components/AppShell';import{Icon}from'@/src/components/icons';

const signals=[['POST','Say what needs doing.'],['AGREE','Set the price + time.'],['MOVE','Watch it move.']];
export default function Home(){
 const[d,setD]=useState<any>(null);
 useEffect(()=>{fetch('/api/dashboard',{cache:'no-store'}).then(r=>r.ok?r.json():{authenticated:false}).then(setD).catch(()=>setD({authenticated:false}))},[]);
 const first=d?.profile?.display_name?d.profile.display_name.split(' ')[0]:'there';
 return <AppShell><main className="shell app-page home-modern">
  <section className="home-hero">
   <div className="home-copy">
    <div className="eyebrow">CAMPUS EXECUTION NETWORK</div>
    <h1>{d?.authenticated?<>Good to see you, <em>{first}.</em></>:<>Get things done.<br/><em>Move on.</em></>}</h1>
    <p className="home-lead">Food. Pickups. Printing. Groceries. Small jobs. Tell CarryGo what needs doing, then let people around you handle the rest.</p>
    <div className="home-cta"><Link href="/do" className="btn dark">I need something <Icon name="arrow" size={17}/></Link><Link href="/earn" className="btn ghost">I want to earn</Link></div>
    <div className="home-trust"><span><Icon name="shield" size={13}/> Protected funding</span><span><Icon name="clock" size={13}/> Price + time agreed first</span><span><Icon name="wifi" size={13}/> 2G-first</span></div>
   </div>
   <div className="home-orbit-card" aria-hidden="true">
    <div className="orbit-glow"/><motion.div className="float-card card-a" animate={{y:[0,-8,0],rotate:[0,1.5,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut'}}><small>RUNNER ON THE WAY</small><b>Green Plaza → Hostel</b><span>ETA 08 min</span></motion.div>
    <motion.div className="float-card card-b" animate={{y:[0,8,0],rotate:[0,-1.2,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut',delay:.3}}><small>YOUR STREAK</small><b>{d?.streak?.discount_percent||0}% banked</b><span>Use any part when you need it.</span></motion.div>
    <div className="orbit-core"><i className="brand-dot"/><strong>CarryGo</strong><span>made for campus life</span></div>
   </div>
  </section>
  <section className="home-flow">{signals.map(([k,v],i)=><motion.div key={k} className="flow-step" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}><b>0{i+1}</b><span>{k}</span><p>{v}</p></motion.div>)}</section>
  {d?.authenticated&&<section className="home-grid">
   <div className="panel streak-panel"><div className="panel-head"><span>STREAK</span><Link href="/you">Open</Link></div><div className="streak-number">{d.streak?.discount_percent||0}<small>% banked</small></div><div className="streak-track"><span style={{width:Math.min(100,d.streak?.discount_percent||0)+'%'}}/></div><p>{d.streak?.current_weeks||0} week streak. Spend any portion when you need it.</p></div>
   <div className="panel live-panel"><div className="panel-head"><span>LIVE MARKET</span><b>{d.openTaskCount||0}</b></div><p>Open requests on your campus right now.</p><Link className="text-link" href="/earn">See what's moving →</Link></div>
  </section>}
  {d?.tasks?.length>0&&<section className="section-tight"><div className="section-label"><span>YOUR CURRENT TASKS</span><Link href="/orders">View all</Link></div><div className="task-list compact">{d.tasks.map((t:any)=><Link href={'/orders/'+t.id} className="task-row" key={t.id}><div><b>{t.title}</b><span>{t.pickup_location_text} → {t.destination_location_text}</span></div><strong>{t.status.replaceAll('_',' ')}</strong></Link>)}</div></section>}
  <section className="home-bottom"><div><small>BUILT FOR REAL NETWORKS</small><h2>Useful when the network isn't.</h2><p>CarryGo keeps the core loop light: typed places, compact updates, local retry and no map required to get an errand moving.</p></div><Link href="/offline" className="btn ghost">See low-data design</Link></section>
 </main></AppShell>
}