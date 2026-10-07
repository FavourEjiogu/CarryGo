'use client';
import{useEffect,useState}from'react';import Link from'next/link';import{AppShell}from'@/src/components/AppShell';import{naira}from'@/src/lib/app-config';

export default function Home(){
 const[d,setD]=useState<any>(null);
 useEffect(()=>{fetch('/api/dashboard').then(r=>r.ok?r.json():Promise.resolve({authenticated:false})).then(setD).catch(()=>setD({authenticated:false}))},[]);
 const first=d?.profile?.display_name?d.profile.display_name.split(' ')[0]:'there';
 return <AppShell><main className="shell app-page">
  <div className="page-top"><div><div className="eyebrow">BINGHAM · KARU</div><h1 className="app-title">{d?.authenticated?'Hi, '+first+'.':'Get something done.'}</h1><p className="sub">The campus execution app. Less typing, less waiting.</p></div><span className="open-state">05:00–22:00</span></div>
  <section className="home-actions">
    <Link href="/do" className="action-tile primary"><small>NEED SOMETHING</small><strong>Tell CarryGo what to do</strong><span>Food, groceries, pickup, printing and campus jobs.</span><i>→</i></Link>
    <Link href="/earn" className="action-tile"><small>WANT TO EARN</small><strong>Take something on your route</strong><span>Set the fee and the time. You stay in control.</span><i>→</i></Link>
  </section>
  {d?.authenticated&&<section className="home-grid">
   <div className="panel streak-panel"><div className="panel-head"><span>STREAK</span><Link href="/you">Open</Link></div><div className="streak-number">{d.streak?.discount_percent||0}<small>% banked</small></div><div className="streak-track"><span style={{width:(Math.min(100,d.streak?.discount_percent||0)+'%')}}/></div><p>{d.streak?.current_weeks||0} week streak. Spend any portion when you need it.</p></div>
   <div className="panel"><div className="panel-head"><span>LIVE MARKET</span><b>{d.openTaskCount||0}</b></div><p className="muted">Open requests around campus right now.</p><Link className="text-link" href="/earn">See tasks →</Link></div>
  </section>}
  {d?.tasks?.length>0&&<section className="section-tight"><div className="section-label"><span>YOUR CURRENT TASKS</span><Link href="/orders">View all</Link></div><div className="task-list compact">{d.tasks.map((t:any)=><Link href={'/orders/'+t.id} className="task-row" key={t.id}><div><b>{t.title}</b><span>{t.pickup_location_text} → {t.destination_location_text}</span></div><strong>{t.status.replaceAll('_',' ')}</strong></Link>)}</div></section>}
  <section className="quiet-card"><div><small>2G FIRST</small><h2>Built to stay useful on bad network.</h2><p>Typed places, tiny payloads, local cache and no map dependency for the core loop.</p></div><Link href="/offline" className="btn ghost">See low-data design</Link></section>
 </main></AppShell>
}
