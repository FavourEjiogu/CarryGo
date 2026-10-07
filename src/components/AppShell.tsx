'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import { motion } from 'motion/react';
import { Icon, type IconName } from '@/src/components/icons';

const nav:[string,string,IconName][]=[['/','Home','home'],['/do','Do','plus'],['/earn','Earn','bolt'],['/orders','Orders','orders'],['/you','You','user']];

export function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const [online,setOnline]=useState(true);
  useEffect(()=>{const f=()=>setOnline(navigator.onLine);f();addEventListener('online',f);addEventListener('offline',f);return()=>{removeEventListener('online',f);removeEventListener('offline',f)}},[]);
  const active=(href:string)=>pathname===href||(href!=='/'&&pathname.startsWith(href));
  return <div className="app">
    <header className="app-header"><div className="shell app-header-in">
      <Link className="brand" href="/"><i className="brand-dot"/>CarryGo</Link>
      <nav className="desktop-app-nav">{nav.map(([href,label,icon])=><Link key={href} href={href} className={active(href)?'active':''}><Icon name={icon} size={15}/>{label}</Link>)}</nav>
      <div className="header-right">{!online&&<span className="offline-pill"><span/>Offline mode</span>}<Link className="header-icon-link" href="/notifications" aria-label="Inbox"><Icon name="bell" size={18}/></Link><Link className="avatar" href="/profile"><Icon name="user" size={16}/><span>You</span></Link></div>
    </div></header>
    <main>{children}</main>
    <nav className="mobile-nav" aria-label="Primary navigation">{nav.map(([href,label,icon])=><Link key={href} href={href} className={active(href)?'active':''}>{active(href)&&<motion.i layoutId="nav-active" className="nav-active"/>}<Icon name={icon} size={18}/><span>{label}</span></Link>)}</nav>
  </div>
}
