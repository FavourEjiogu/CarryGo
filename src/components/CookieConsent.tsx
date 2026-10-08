'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {setAnalyticsConsent} from '@/src/lib/analytics';

const KEY='carrygo:privacy-consent:v1';
const PUBLIC_PATHS=new Set(['/','/login','/privacy','/terms','/faq']);

export function CookieConsent(){
  const pathname=usePathname();
  const[visible,setVisible]=useState(false);
  useEffect(()=>{
    if(!PUBLIC_PATHS.has(pathname)) return;
    try{
      if(!window.localStorage.getItem(KEY)) setVisible(true);
    }catch{setVisible(true)}
  },[pathname]);
  if(!visible||!PUBLIC_PATHS.has(pathname)) return null;
  function choose(value:'granted'|'denied'){
    try{window.localStorage.setItem(KEY,value)}catch{}
    setAnalyticsConsent(value==='granted');
    setVisible(false);
  }
  return <aside className="privacy-consent" aria-label="Privacy choices">
    <h2>Privacy, without the mystery.</h2>
    <p>CarryGo uses essential session storage to run the app. Optional product analytics helps us improve the experience without session recording or automatic click capture. <Link href="/privacy">Read the privacy notice.</Link></p>
    <div className="privacy-consent-actions">
      <button className="btn dark" type="button" onClick={()=>choose('granted')}>Allow analytics</button>
      <button className="btn ghost" type="button" onClick={()=>choose('denied')}>Essential only</button>
    </div>
    <div className="privacy-consent-meta">Your choice is stored on this device and this notice is shown once before sign-in.</div>
  </aside>;
}
