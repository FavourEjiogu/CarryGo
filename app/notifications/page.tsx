'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionPage } from '@/src/components/MotionPage';
import { Icon } from '@/src/components/icons';
import { AppShell } from '@/src/components/AppShell';

export default function NotificationsPage(){
  const [items,setItems]=useState<any[]>([]);
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState('');
  async function load(){
    setBusy(true);
    try{
      const r=await fetch('/api/notifications');
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||'Sign in required');
      setItems(j.notifications||[]);
    }catch(e){setError(e instanceof Error?e.message:'Could not load inbox.');}
    finally{setBusy(false);}
  }
  useEffect(()=>{load();},[]);
  async function mark(id?:string){
    await fetch('/api/notifications',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(id?{id}:{all:true})});
    setItems(x=>id?x.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n):x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));
  }
  if(error)return <AppShell><main className="shell app-page narrow"><div className="card success"><h2>{error}</h2><Link className="btn dark" href="/login">Sign in</Link></div></main></AppShell>;
  return <AppShell><MotionPage className="shell app-page narrow">
    <div className="page-top"><div><div className="eyebrow">INBOX</div><h1 className="app-title">Keep moving.</h1><p className="sub">Offers, task updates, wallet events and useful CarryGo nudges.</p></div>{items.some(x=>!x.read_at)&&<button className="btn ghost" onClick={()=>mark()}>Mark all read</button>}</div>
    <div className="notification-list">
      {busy ? [1,2,3].map(i=><div className="notification-skeleton card" key={i}/>) :
      items.length ? items.map(n=><article key={n.id} className={n.read_at?'notification card':'notification card unread'} onClick={()=>!n.read_at&&mark(n.id)}>
        <span className="notification-icon"><Icon name={n.kind?.includes('FUND')?'wallet':n.kind?.includes('BID')?'bolt':'bell'} size={17}/></span>
        <div><div className="notification-head"><b>{n.title}</b><small>{new Date(n.created_at).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</small></div><p>{n.body}</p></div>
      </article>) : <div className="card success"><h2>Your inbox is quiet.</h2><p className="sub">Updates will appear here when something happens.</p></div>}
    </div>
  </MotionPage></AppShell>;
}
