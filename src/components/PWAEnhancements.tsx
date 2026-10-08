'use client';

import{useEffect,useRef,useState}from'react';
import{usePathname}from'next/navigation';

const CONSENT_KEY='cg:analytics-consent:v1';
const INSTALL_KEY='cg:pwa-install-dismissed:v1';
const PUBLIC_PATHS=new Set(['/','/login','/faq','/privacy','/terms','/merchants']);

type BeforeInstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};

function CookieConsent(){
 const[visible,setVisible]=useState(false);
 useEffect(()=>{try{if(localStorage.getItem(CONSENT_KEY))return;setVisible(true)}catch{}},[]);
 if(!visible)return null;
 const choose=(value:'accepted'|'declined')=>{try{localStorage.setItem(CONSENT_KEY,value)}catch{};window.dispatchEvent(new Event('cg:analytics-consent'));setVisible(false)};
 return <aside className="consent-banner" aria-label="Cookie and analytics notice">
   <div><b>One small privacy choice.</b><p>CarryGo needs essential session cookies to sign you in. Optional analytics stays off unless you allow it.</p><a href="/privacy">Read Privacy</a></div>
   <div className="consent-actions"><button className="btn ghost" type="button" onClick={()=>choose('declined')}>Not now</button><button className="btn dark" type="button" onClick={()=>choose('accepted')}>Allow analytics</button></div>
 </aside>
}

function InstallPrompt(){
 const[deferred,setDeferred]=useState<BeforeInstallPromptEvent|null>(null);
 const[visible,setVisible]=useState(false);
 useEffect(()=>{
   let dismissed=false;
   try{dismissed=localStorage.getItem(INSTALL_KEY)==='1'}catch{}
   const standalone=window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);
   if(standalone||dismissed)return;
   const onPrompt=(event:Event)=>{event.preventDefault();setDeferred(event as BeforeInstallPromptEvent)};
   const onInstalled=()=>{setDeferred(null);setVisible(false);try{localStorage.removeItem(INSTALL_KEY)}catch{}};
   window.addEventListener('beforeinstallprompt',onPrompt);
   window.addEventListener('appinstalled',onInstalled);
   return()=>{window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled)};
 },[]);
 useEffect(()=>{if(!deferred)return;const t=window.setTimeout(()=>setVisible(true),1800);return()=>window.clearTimeout(t)},[deferred]);
 if(!visible||!deferred)return null;
 async function install(){await deferred.prompt();const result=await deferred.userChoice;if(result.outcome==='dismissed'){try{localStorage.setItem(INSTALL_KEY,'1')}catch{}}setVisible(false)}
 function dismiss(){try{localStorage.setItem(INSTALL_KEY,'1')}catch{}setVisible(false)}
 return <aside className="install-prompt" aria-label="Install CarryGo">
   <div><b>Keep CarryGo close.</b><p>Install it for a faster app-like launch from your home screen.</p></div>
   <div className="consent-actions"><button className="btn ghost" type="button" onClick={dismiss}>Not now</button><button className="btn lime" type="button" onClick={install}>Install</button></div>
 </aside>
}

function NetworkStatus(){
 const[state,setState]=useState<'offline'|'online'|null>(null);
 const timer=useRef<number|null>(null);
 useEffect(()=>{const off=()=>setState('offline');const on=()=>{setState('online');if(timer.current)window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>setState(null),2200)};if(!navigator.onLine)setState('offline');window.addEventListener('offline',off);window.addEventListener('online',on);return()=>{window.removeEventListener('offline',off);window.removeEventListener('online',on);if(timer.current)window.clearTimeout(timer.current)}},[]);
 if(!state)return null;
 return <div className={'network-toast '+state} role="status" aria-live="polite">{state==='offline'?'Connection lost. Your page is still here.':'Back online.'}</div>
}

export function PWAEnhancements(){
 const pathname=usePathname();
 const[authenticated,setAuthenticated]=useState<boolean|null>(null);
 const publicSurface=PUBLIC_PATHS.has(pathname);
 useEffect(()=>{
   if(!publicSurface){setAuthenticated(null);return}
   let live=true;
   fetch('/api/me',{cache:'no-store',credentials:'same-origin'}).then(r=>{if(live)setAuthenticated(r.ok)}).catch(()=>{if(live)setAuthenticated(false)});
   return()=>{live=false};
 },[publicSurface]);
 return <>{publicSurface&&authenticated===false?<CookieConsent/>:null}<InstallPrompt/><NetworkStatus/></>;
}
