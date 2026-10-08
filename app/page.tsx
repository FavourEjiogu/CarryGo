'use client';

import{useEffect,useMemo,useState}from'react';
import Link from'next/link';
import{motion}from'motion/react';
import{AppShell}from'@/src/components/AppShell';
import{Icon}from'@/src/components/icons';
import{MouseFollowingEyes}from'@/components/ui/mouse-following-eyes';import{Tour,useTour,type TourStep}from'@/components/ui/product-tour';

type Dashboard={
 authenticated:boolean;
 profile?:{display_name?:string}|null;
 campus?:{name:string;city?:string|null;state?:string|null}|null;
 streak?:{current_weeks?:number;discount_percent?:number}|null;
 openTaskCount?:number;
 tasks?:Array<{id:string;title:string;status:string;pickup_location_text:string;destination_location_text:string}>;
};

const steps=[
  ['01','POST','Tell CarryGo what needs doing.'],
  ['02','AGREE','Choose the runner, price and timing.'],
  ['03','MOVE','Follow it through to handoff.'],
] as const;

export default function Home(){
 const[d,setD]=useState<Dashboard|null>(null);const tour=useTour('cg:tour:v1');
 useEffect(()=>{if(tour.seen())return;const t=window.setTimeout(()=>tour.start(),900);return()=>clearTimeout(t)},[tour.seen,tour.start]);
 useEffect(()=>{fetch('/api/dashboard',{cache:'no-store'}).then(async r=>r.status===401?{authenticated:false}:r.ok?r.json():{authenticated:false}).then(setD).catch(()=>setD({authenticated:false}))},[]);
 const first=useMemo(()=>d?.profile?.display_name?.trim().split(/\s+/)[0]||'there',[d]);
 const campusLabel=d?.campus?.name?(d.campus.city?d.campus.name+' · '+d.campus.city:d.campus.name):'Your campus';
 const current=d?.tasks?.[0];
 const liveCount=d?.openTaskCount||0;

 return <AppShell><main className="shell app-page home-modern">
   <section className="home-landing-hero">
     <div className="home-landing-copy">
       <div className="eyebrow">{d?.authenticated?campusLabel.toUpperCase():'CAMPUS SERVICES'}</div>
       <h1>{d?.authenticated?<>Good to see you, <em>{first}.</em></>:<>Get things done.<br/><em>Keep moving.</em></>}</h1>
       <p className="home-lead">Need something picked up, bought, delivered or handled nearby? Post it here. A runner takes it from there.</p>
       <div className="home-cta">
         <Link id="tour-do" href="/do" className="btn dark energy-border">I need something <Icon name="arrow" size={17}/></Link>
         <Link id="tour-earn" href="/earn" className="btn ghost">I want to earn</Link>
       </div>
       {d?.authenticated&&<div className="home-context"><span><b>{liveCount}</b> open request{liveCount===1?'':'s'}</span><span><b>{d.streak?.current_weeks||0}</b> week streak</span></div>}
     </div>

     <div className="home-landing-visual">
       <div className="home-visual-top"><span>GET / DONE</span><span>01—03</span></div>
       <MouseFollowingEyes className="home-eyes"/>
       <div className="home-visual-copy">
         <small>THE SIMPLE LOOP</small>
         <strong>Post.<br/>Agree.<br/><em>Move.</em></strong>
       </div>
       <div className="home-visual-note"><span className="brand-dot"/> Built around the way your campus actually works.</div>
     </div>
   </section>

   <section className="home-action-grid" aria-label="Start with CarryGo">
     <Link href="/do" className="home-action-card home-action-primary energy-border">
       <div><span className="action-index">01</span><Icon name="arrow" size={18}/></div>
       <small>I NEED SOMETHING</small>
       <h2>Post a task.</h2>
       <p>Describe it in your own words. Agree on the details before anything moves.</p>
     </Link>
     <Link href="/earn" className="home-action-card">
       <div><span className="action-index">02</span><Icon name="arrow" size={18}/></div>
       <small>I WANT TO EARN</small>
       <h2>Take a task.</h2>
       <p>See what people around your campus need and choose work that fits you.</p>
     </Link>
   </section>

   <section className="home-process" id="tour-how"> aria-label="How CarryGo works">
     <div className="section-label"><span>HOW IT WORKS</span><span>THREE MOVES</span></div>
     <div className="home-process-grid">
       {steps.map(([n,k,copy])=><motion.article key={n} className="home-process-step" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:Number(n)*.04}}>
         <span>{n}</span><b>{k}</b><p>{copy}</p>
       </motion.article>)}
     </div>
   </section>

   {d?.authenticated&&<section className="home-grid home-status-grid">
     <div className="panel">
       <div className="panel-head"><span>YOUR CAMPUS</span><Link href="/campus">Open</Link></div>
       <h2>{campusLabel}</h2>
       <p>Places, requests and people are kept in your campus context.</p>
       <Link className="text-link" href="/campus">Explore your campus →</Link>
     </div>
     <div className="panel">
       <div className="panel-head"><span>YOUR NEXT MOVE</span><Link href="/orders">Orders</Link></div>
       <h2>{current?.title||'Nothing waiting.'}</h2>
       <p>{current?current.pickup_location_text+' → '+current.destination_location_text:'Post a task or pick one up when you are ready.'}</p>
       {current&&<Link className="text-link" href={'/orders/'+current.id}>Open task →</Link>}
     </div>
   </section>}

   {d?.tasks?.length? <section className="section-tight"><div className="section-label"><span>YOUR CURRENT TASKS</span><Link href="/orders">View all</Link></div><div className="task-list compact">{d.tasks.map(t=><Link href={'/orders/'+t.id} className="task-row" key={t.id}><div><b>{t.title}</b><span>{t.pickup_location_text} → {t.destination_location_text}</span></div><strong>{t.status.replaceAll('_',' ')}</strong></Link>)}</div></section>:null}

   {!d?.authenticated&&<section className="home-reassurance energy-border">
     <div>
       <small>NEW HERE?</small>
       <h2>Start with your campus.</h2>
       <p>Choose your school during sign-up, then CarryGo keeps the experience centred on your local context.</p>
     </div>
     <Link className="btn dark" href="/login?mode=signup">Create account <Icon name="arrow" size={16}/></Link>
   </section>}
 </main></AppShell>
}