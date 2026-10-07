'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';

const nav=[['/','Home'],['/do','Do'],['/earn','Earn'],['/orders','Orders'],['/you','You']];

export function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const [online,setOnline]=useState(true);
  useEffect(()=>{const f=()=>setOnline(navigator.onLine);f();addEventListener('online',f);addEventListener('offline',f);return()=>{removeEventListener('online',f);removeEventListener('offline',f)}},[]);
  return <div className="app">
    <header className="app-header"><div className="shell app-header-in">
      <Link className="brand" href="/"><i className="brand-dot"/>CarryGo</Link>
      <div className="header-right">{!online&&<span className="offline-pill">Offline queue on</span>}<Link className="header-link" href="/notifications">Inbox</Link><Link className="avatar" href="/profile">You</Link></div>
    </div></header>
    <main>{children}</main>
    <nav className="mobile-nav">{nav.map(([href,label])=><Link key={href} className={pathname===href||href!=='/'&&pathname.startsWith(href)?'active':''} href={href}>{label}</Link>)}</nav>
  </div>
}
