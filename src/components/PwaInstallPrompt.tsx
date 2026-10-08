'use client';
import{useEffect,useRef,useState}from'react';import{usePathname}from'next/navigation';import{Icon}from'@/src/components/icons';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>};
const KEY='cg:pwa-install:v1',COOKIE_KEY='cg:cookie-notice:v1';
function saved(){try{return localStorage.getItem(KEY)==='1'}catch{return false}}
function cookieAcknowledged(){try{return localStorage.getItem(COOKIE_KEY)==='1'}catch{return false}}
function standalone(){try{return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone)}catch{return false}}
export function PwaInstallPrompt(){
 const pathname=usePathname();const promptRef=useRef<InstallEvent|null>(null);const[mode,setMode]=useState<'chromium'|'ios'|null>(null);
 useEffect(()=>{
  if(pathname!=='/'||saved()||standalone())return;let dead=false;
  const revealIfAllowed=()=>{if(!dead&&cookieAcknowledged()&&promptRef.current)setMode('chromium')};
  const onBefore=(event:Event)=>{event.preventDefault();promptRef.current=event as InstallEvent;revealIfAllowed()};
  const onCookie=()=>revealIfAllowed();
  window.addEventListener('beforeinstallprompt',onBefore);window.addEventListener('carrygo:cookie-acknowledged',onCookie);
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&/webkit/i.test(navigator.userAgent)&&!standalone();
  const timer=window.setTimeout(()=>{if(!dead&&cookieAcknowledged()&&!promptRef.current&&ios)setMode('ios')},9000);
  return()=>{dead=true;window.clearTimeout(timer);window.removeEventListener('beforeinstallprompt',onBefore);window.removeEventListener('carrygo:cookie-acknowledged',onCookie)};
 },[pathname]);
 function dismiss(){try{localStorage.setItem(KEY,'1')}catch{}setMode(null);promptRef.current=null}
 async function install(){const p=promptRef.current;if(!p){dismiss();return}await p.prompt();await p.userChoice;dismiss()}
 const visibleMode=pathname==='/'&&cookieAcknowledged()?mode:null;if(!visibleMode)return null;
 return <aside className="pwa-install-card" role="region" aria-label="Install CarryGo"><div className="pwa-install-icon"><Icon name="download" size={17}/></div><div className="pwa-install-copy"><strong>Add CarryGo to your home screen.</strong><p>{visibleMode==='ios'?'In Safari: Share → Add to Home Screen.':'Install the app for faster access and a more native feel.'}</p></div><div className="pwa-install-actions">{visibleMode==='chromium'&&<button className="btn dark" type="button" onClick={()=>void install()}>Install</button>}<button className="btn ghost" type="button" onClick={dismiss}>Not now</button></div></aside>
}