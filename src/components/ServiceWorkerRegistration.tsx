'use client';
import{useEffect}from'react';import{useToast}from'@/src/components/ToastProvider';

export function ServiceWorkerRegistration(){
 const{toast}=useToast();
 useEffect(()=>{
  if(!('serviceWorker' in navigator))return;
  const online=()=>toast('Back online','CarryGo can sync queued delivery location updates.','success');
  const offline=()=>toast("You're offline",'Public screens may remain available and queued delivery updates will retry.','info');
  window.addEventListener('online',online);window.addEventListener('offline',offline);
  void navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{if(reg.update)void reg.update().catch(()=>{})}).catch(()=>{});
  return()=>{window.removeEventListener('online',online);window.removeEventListener('offline',offline)};
 },[toast]);
 return null;
}