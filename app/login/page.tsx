'use client';

import { FormEvent,useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence,motion } from 'motion/react';
import { Icon } from '@/src/components/icons';
import { MotionPage } from '@/src/components/MotionPage';
import { MouseFollowingEyes } from '@/components/ui/mouse-following-eyes';
import { OtpInput } from '@/components/ui/otp-input';
import { track } from '@/src/lib/analytics';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/browser';
import { CookieConsent } from '@/src/components/CookieConsent';

type Mode='signin'|'signup';
type Method='otp'|'link'|'password';

const ERROR_COPY:Record<string,string>={
 missing_code:'That sign-in link is incomplete. Request a fresh one.',
 auth_failed:'That link could not be verified. Request a fresh one and try again.',
 auth_config:'Sign-in is temporarily misconfigured. Try again or use the one-time code.',
};

const siteOrigin=()=>window.location.origin.replace(/\/$/,'');
const safeNext=(value:string|null)=>value&&value.startsWith('/')&&!value.startsWith('//')?value:'/';

export default function Login(){
 const router=useRouter();
 const[mode,setMode]=useState<Mode>('signin'),[method,setMethod]=useState<Method>('otp');
 const[name,setName]=useState(''),[email,setEmail]=useState(''),[code,setCode]=useState(''),[password,setPassword]=useState('');
 const[remember,setRemember]=useState(true),[sent,setSent]=useState(false),[seconds,setSeconds]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[passwordFocus,setPasswordFocus]=useState(false);

 useEffect(()=>{const timer=window.setTimeout(()=>{try{setRemember(localStorage.getItem('cg:remember-me')!=='0')}catch{}const p=new URLSearchParams(window.location.search);const m=p.get('mode');if(m==='signin'||m==='signup')setMode(m);const mt=p.get('method');if(mt==='otp'||mt==='link'||mt==='password')setMethod(mt);const e=p.get('error');if(e)setError(ERROR_COPY[e]||'Something went wrong. Try again.')},0);return()=>window.clearTimeout(timer)},[]);
 useEffect(()=>{if(!seconds)return;const t=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(t)},[seconds]);

 const title=useMemo(()=>mode==='signup'?<>A better way to <em>get things done.</em></>:<>Welcome <em>back.</em></>,[mode]);
 const goAfterAuth=async()=>{const supabase=getSupabaseBrowserClient(remember);const{data:aal}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();const next=safeNext(new URLSearchParams(location.search).get('next'));if(aal?.nextLevel==='aal2'&&aal?.currentLevel!=='aal2'){router.replace('/mfa?next='+encodeURIComponent(next));return}const r=await fetch('/api/me',{cache:'no-store'}),j=await r.json().catch(()=>({}));if(!r.ok||!j.profile)throw new Error('Your session was created, but your account could not be loaded. Try again.');try{localStorage.removeItem('cg:pending-signup')}catch{}router.replace(j.profile.display_name&&j.profile.phone_number&&j.profile.campus_id?next:'/onboarding')};

 async function sendVerification(){
  setBusy(true);setError('');
  try{
   if(mode==='signup'&&name.trim().length<2){setError('Add your name first.');return}
   if(!email.trim()){setError('Enter your email address.');return}
   if(method==='password'){
    if(mode!=='signin'){setError('Password is set later from Security. Start with the one-time code.');return}
    if(password.length<1){setError('Enter your password.');return}
    const supabase=getSupabaseBrowserClient(remember);const{error:e}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(e){setError('Email or password is incorrect.');return}
    try{localStorage.setItem('cg:remember-me',remember?'1':'0')}catch{}await goAfterAuth();return;
   }
   const supabase=getSupabaseBrowserClient(remember);
   const options:any={shouldCreateUser:mode==='signup',data:mode==='signup'?{display_name:name.trim(),carrygo_auth_method:method}: {carrygo_auth_method:method}};
   if(method==='link')options.emailRedirectTo=siteOrigin()+'/auth/callback?flow='+mode+'&method=link&remember='+(remember?'1':'0');
   const{error:e}=await supabase.auth.signInWithOtp({email:email.trim().toLowerCase(),options});if(e){setError(e.message);return}
   try{localStorage.setItem('cg:remember-me',remember?'1':'0');if(mode==='signup')localStorage.setItem('cg:pending-signup',JSON.stringify({name:name.trim(),email:email.trim().toLowerCase()}))}catch{}
   track('auth verification requested',{mode,method,keep_signed_in:remember});
   setSent(true);setCode('');setSeconds(30);
  }catch(e){setError(e instanceof Error?e.message:'Could not continue.')}finally{setBusy(false)}
 }

 async function verifyCode(value=code){
  const normalized=value.replace(/\D/g,'');if(normalized.length!==6){setError('Enter the 6-digit code from your email.');return}
  setBusy(true);setError('');
  try{const supabase=getSupabaseBrowserClient(remember);const{error:e}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:normalized,type:'email'});if(e){setError('That code is invalid or expired. Request a new one.');return}track('auth verification completed',{mode,method:'otp',keep_signed_in:remember});await goAfterAuth()}catch(e){setError(e instanceof Error?e.message:'That code could not be verified.')}finally{setBusy(false)}
 }

 async function submit(e:FormEvent){e.preventDefault();if(sent&&method==='otp'){await verifyCode();return}await sendVerification()}
 const eyesClosed=passwordFocus||password.length>0;

 return <><main className="auth-page">
  <div className="auth-orbit auth-orbit-one" aria-hidden="true"/><div className="auth-orbit auth-orbit-two" aria-hidden="true"/>
  <div className="auth-layout">
   <aside className="auth-brand-panel"><Link className="brand auth-brand" href="/"><i className="brand-dot"/>CarryGo</Link><div className="auth-brand-copy"><span className="auth-kicker">CAMPUS EXECUTION</span><h2>Campus errands, <em>without the back-and-forth.</em></h2><p>Tell us what you need. We turn the messy parts into something simple.</p></div><div className="auth-feature-stack"><div><Icon name="bolt" size={17}/><span>Negotiate price + time</span></div><div><Icon name="location" size={17}/><span>Follow the job as it moves</span></div><div><Icon name="shield" size={17}/><span>Protect wallet + handoff</span></div></div><span className="auth-footnote">Built for the way students actually move.</span></aside>
   <MotionPage className="auth-card-wrap">
    <header className="auth-mobile-top"><Link className="brand" href="/"><i className="brand-dot"/>CarryGo</Link></header>
    <div className="auth-card card">
     <MouseFollowingEyes className="login-eyes" closed={eyesClosed}/>
     <div className="auth-switch" role="tablist" aria-label="Account access"><button role="tab" aria-selected={mode==='signin'} className={mode==='signin'?'active':''} type="button" onClick={()=>{setMode('signin');setError('');setSent(false);setCode('')}}>Sign in</button><button role="tab" aria-selected={mode==='signup'} className={mode==='signup'?'active':''} type="button" onClick={()=>{setMode('signup');setError('');setSent(false);setCode('');setMethod('otp')}}>Create account</button></div>
     <AnimatePresence mode="wait">{sent&&method==='otp'?<motion.div key="otp" className="auth-sent" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><div className="mail-orb"><Icon name="shield" size={24}/></div><span className="auth-kicker">CODE SENT</span><h1>Enter the <em>code.</em></h1><p>We sent a 6-digit code to <b>{email.trim().toLowerCase()}</b>.</p><form className="auth-form" onSubmit={submit}><OtpInput autoFocus value={code} onChange={setCode} status={error?'error':'idle'} errorMessage={error} hint="Use the latest code from your email." onComplete={verifyCode}/><button className="btn dark full auth-submit" type="submit" disabled={busy||code.length!==6}>{busy?'Verifying…':'Verify and continue'}<Icon name="arrow" size={17}/></button></form><button className="btn ghost full" type="button" disabled={seconds>0||busy} onClick={sendVerification}>{seconds>0?'Resend code in '+seconds+'s':'Resend code'}</button><button className="btn ghost full" type="button" onClick={()=>{setSent(false);setCode('');setError('')}}>Use a different method</button></motion.div>:
     sent&&method==='link'?<motion.div key="link" className="auth-sent" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><div className="mail-orb"><Icon name="mail" size={24}/></div><span className="auth-kicker">LINK SENT</span><h1>Check your <em>email.</em></h1><p>We sent a secure sign-in link to <b>{email.trim().toLowerCase()}</b>.</p><div className="auth-sent-note"><Icon name="shield" size={16}/><span>Open the link on this device. It will return to CarryGo.</span></div>{error&&<div className="auth-error" role="alert">{error}</div>}<button className="btn ghost full" type="button" disabled={seconds>0||busy} onClick={sendVerification}>{seconds>0?'Resend link in '+seconds+'s':'Resend link'}</button><button className="btn ghost full" type="button" onClick={()=>{setMethod('otp');setSent(false);setError('')}}>Use one-time code instead</button></motion.div>:
     <motion.div key="form" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><div className="auth-kicker">{mode==='signup'?'FIRST TIME HERE':'SIGN IN'}</div><h1>{title}</h1><p className="auth-sub">{mode==='signup'?'Start with your name and email. We’ll finish the useful bits after verification.':'Use a one-time code, a magic link, or your password if you have one.'}</p>
      <div className="auth-method" role="group" aria-label="Verification method"><button type="button" className={method==='otp'?'active':''} onClick={()=>{setMethod('otp');setError('')}}><Icon name="shield" size={16}/><span><b>One-time code</b><small>6 digits · recommended</small></span></button><button type="button" className={method==='link'?'active':''} onClick={()=>{setMethod('link');setError('')}}><Icon name="mail" size={16}/><span><b>Magic link</b><small>Tap once</small></span></button>{mode==='signin'&&<button type="button" className={method==='password'?'active':''} onClick={()=>{setMethod('password');setError('')}}><Icon name="shield" size={16}/><span><b>Password</b><small>Optional</small></span></button>}</div>
      <form onSubmit={submit} className="auth-form">{mode==='signup'&&<label>Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/></label>}<label>Email<input autoFocus={mode==='signin'&&!passwordFocus} required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email"/></label>{method==='password'&&<label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} onFocus={()=>setPasswordFocus(true)} onBlur={()=>setPasswordFocus(false)} autoComplete="current-password" placeholder="Your password"/><small className="hint">Passwords are optional. Set one later from Security.</small></label>}<label className="remember"><input id="remember-me" type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span><b>Keep me signed in</b><small>Controls how long this device keeps your session.</small></span></label>{method==='password'&&<Link className="text-link" href="/reset-password">Forgot password?</Link>}{error&&<div className="auth-error" role="alert"><Icon name="shield" size={15}/>{error}</div>}<button className="btn dark full auth-submit" type="submit" disabled={busy}>{busy?(method==='password'?'Signing in…':'Sending…'):mode==='signup'?'Create my account':method==='password'?'Sign in with password':method==='otp'?'Send one-time code':'Send sign-in link'}<Icon name="arrow" size={17}/></button></form><div className="auth-trust"><span><Icon name="shield" size={14}/>Secure by design</span><span><Icon name={method==='link'?'mail':'shield'} size={14}/>{method==='link'?'One-tap link':'6-digit code'}</span><span><Icon name="map" size={14}/>Campus-first</span></div>
     </motion.div>}</AnimatePresence>
    </div>
    <p className="auth-legal">By continuing, you agree to use CarryGo responsibly and follow the delivery rules shown in the app.</p>
   </MotionPage>
  </div>
 </main><CookieConsent /></>
}