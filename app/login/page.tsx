'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/src/components/icons';
import { MotionPage } from '@/src/components/MotionPage';
import { track } from '@/src/lib/analytics';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/browser';

type Mode = 'signin' | 'signup';
type Method = 'link' | 'otp';

const ERROR_COPY: Record<string,string> = {
  missing_code: 'That sign-in link is incomplete. Request a fresh one.',
  auth_failed: 'That link could not be verified. Request a fresh one and try again.',
  auth_config: 'Sign-in is temporarily misconfigured for this deployment. Use the latest CarryGo link or contact the team.',
};

export default function Login() {
  const router=useRouter();
  const [mode,setMode]=useState<Mode>('signin');
  const [method,setMethod]=useState<Method>('link');
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [code,setCode]=useState('');
  const [remember,setRemember]=useState(true);
  const [sent,setSent]=useState(false);
  const [seconds,setSeconds]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    queueMicrotask(()=>{
      try{setRemember(localStorage.getItem('cg:remember-me')!=='0')}catch{}
      const params=new URLSearchParams(window.location.search);
      const incoming=params.get('mode');
      if(incoming==='signup'||incoming==='signin')setMode(incoming);
      const incomingMethod=params.get('method');
      if(incomingMethod==='otp'||incomingMethod==='link')setMethod(incomingMethod);
      const e=params.get('error');
      if(e)setError(ERROR_COPY[e]||'Something went wrong. Try again.');
    });
  },[]);

  useEffect(()=>{
    if(!seconds)return;
    const t=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);
    return()=>window.clearInterval(t);
  },[seconds]);

  const title=useMemo(()=>mode==='signup'?<>A better way to <em>get things done.</em></>:<>Welcome <em>back.</em></>,[mode]);

  async function finishAuthentication(){
    const r=await fetch('/api/me',{cache:'no-store'});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j?.profile){
      throw new Error('Your session was created, but your account could not be loaded. Try again.');
    }
    const complete=Boolean(j.profile.display_name&&j.profile.phone_number&&j.profile.campus_id);
    localStorage.removeItem('cg:pending-signup');
    router.replace(complete?'/':'/onboarding');
  }

  async function sendCode(){
    setBusy(true);setError('');
    try{
      if(mode==='signup'&&name.trim().length<2){setError('Add your name so your account starts personal.');return;}
      if(!email.trim()){setError('Enter your email address.');return;}
      const supabase=getSupabaseBrowserClient(remember);
      const site=(process.env.NEXT_PUBLIC_SITE_URL||window.location.origin).replace(/\/$/,'');
      const redirect=site+'/auth/callback?flow='+mode+'&method=link&remember='+(remember?'1':'0');
      const {error:authError}=await supabase.auth.signInWithOtp({
        email:email.trim().toLowerCase(),
        options:{
          emailRedirectTo:redirect,
          shouldCreateUser:mode==='signup',
        },
      });
      if(authError){setError(authError.message);return;}
      try{localStorage.setItem('cg:remember-me',remember?'1':'0')}catch{}
      if(mode==='signup'){
        try{localStorage.setItem('cg:pending-signup',JSON.stringify({name:name.trim(),email:email.trim().toLowerCase()}))}catch{}
      }
      track('auth verification requested',{mode,method,keep_signed_in:remember});
      setSent(true);setCode('');setSeconds(30);
    }catch(e){setError(e instanceof Error?e.message:'Could not send your verification message.');}
    finally{setBusy(false)}
  }

  async function verifyCode(){
    const normalized=code.replace(/\D/g,'');
    if(normalized.length!==6){setError('Enter the 6-digit code from your email.');return;}
    setBusy(true);setError('');
    try{
      const supabase=getSupabaseBrowserClient(remember);
      const {error:verifyError}=await supabase.auth.verifyOtp({
        email:email.trim().toLowerCase(),
        token:normalized,
        type:'email',
      });
      if(verifyError){setError(verifyError.message);return;}
      track('auth verification requested',{mode,method:'otp_verified',keep_signed_in:remember});
      await finishAuthentication();
    }catch(e){setError(e instanceof Error?e.message:'That code could not be verified.');}
    finally{setBusy(false)}
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(sent&&method==='otp'){await verifyCode();return}
    await sendCode();
  }

  return <main className="auth-page">
    <div className="auth-orbit auth-orbit-one" aria-hidden="true"/><div className="auth-orbit auth-orbit-two" aria-hidden="true"/>
    <div className="auth-layout">
      <aside className="auth-brand-panel">
        <Link className="brand auth-brand" href="/"><i className="brand-dot"/>CarryGo</Link>
        <div className="auth-brand-copy"><span className="auth-kicker">CAMPUS EXECUTION</span><h2>Campus errands, <em>without the back-and-forth.</em></h2><p>Post it. Agree on the price and time. Fund it. Watch it move.</p></div>
        <div className="auth-feature-stack"><div><Icon name="bolt" size={17}/><span>Price + time negotiation</span></div><div><Icon name="location" size={17}/><span>Live delivery tracking</span></div><div><Icon name="shield" size={17}/><span>Wallet + handoff protection</span></div></div>
        <span className="auth-footnote">Built for the way students actually move.</span>
      </aside>

      <MotionPage className="auth-card-wrap">
        <header className="auth-mobile-top"><Link className="brand" href="/"><i className="brand-dot"/>CarryGo</Link></header>
        <div className="auth-card card">
          <div className="auth-switch" role="tablist" aria-label="Account access">
            <button role="tab" aria-selected={mode==='signin'} className={mode==='signin'?'active':''} type="button" onClick={()=>{setMode('signin');setError('');setSent(false);setCode('')}}>Sign in</button>
            <button role="tab" aria-selected={mode==='signup'} className={mode==='signup'?'active':''} type="button" onClick={()=>{setMode('signup');setError('');setSent(false);setCode('')}}>Create account</button>
          </div>

          <AnimatePresence mode="wait">
            {sent ? <motion.div key="sent" className="auth-sent" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="mail-orb"><Icon name={method==='otp'?'shield':'mail'} size={24}/></div>
              <span className="auth-kicker">{method==='otp'?'CODE SENT':'LINK SENT'}</span>
              <h1>{method==='otp'?<>Enter the <em>code.</em></>:<>Check your <em>email.</em></>}</h1>
              <p>{method==='otp'?'We sent a 6-digit code to ':'We sent a secure one-time sign-in link to '}<b>{email.trim().toLowerCase()}</b>.</p>

              {method==='otp' ? <form className="auth-form" onSubmit={verifyCode}>
                <label>Verification code
                  <input className="otp-input" autoFocus value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" placeholder="123456" aria-describedby="otp-help"/>
                </label>
                <small id="otp-help" className="hint">Use the latest code. Older codes may no longer work.</small>
                {error&&<div className="auth-error" role="alert"><Icon name="shield" size={15}/>{error}</div>}
                <button className="btn dark full auth-submit" type="submit" disabled={busy||code.length!==6}>{busy?'Verifying…':'Verify and continue'}<Icon name="arrow" size={17}/></button>
              </form> :
              <>
                <div className="auth-sent-note"><Icon name="shield" size={16}/><span>Open the link on this device. Your session stays on this device according to your setting.</span></div>
                {error&&<div className="auth-error" role="alert"><Icon name="shield" size={15}/>{error}</div>}
                <button className="btn dark full" type="button" disabled={seconds>0||busy} onClick={sendCode}>{seconds>0?'Resend in '+seconds+'s':'Resend link'}</button>
              </>}

              <button className="btn ghost full" type="button" onClick={()=>{setSent(false);setCode('');setError('')}}>Use a different method</button>
              <button className="text-link auth-method-back" type="button" onClick={()=>{setSent(false);setCode('');setError('')}}>Back</button>
            </motion.div> : <motion.div key="form" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="auth-kicker">{mode==='signup'?'FIRST TIME HERE':'SIGN IN'}</div>
              <h1>{title}</h1>
              <p className="auth-sub">{mode==='signup'?'Start with your name and email. We’ll finish the useful bits after verification.':'Use your email. We’ll send a secure verification message — no password required.'}</p>

              <div className="auth-method" role="group" aria-label="Verification method">
                <button type="button" className={method==='link'?'active':''} aria-pressed={method==='link'} onClick={()=>{setMethod('link');setError('')}}>
                  <Icon name="mail" size={16}/><span><b>Magic link</b><small>Tap once</small></span>
                </button>
                <button type="button" className={method==='otp'?'active':''} aria-pressed={method==='otp'} onClick={()=>{setMethod('otp');setError('')}}>
                  <Icon name="shield" size={16}/><span><b>One-time code</b><small>Enter 6 digits</small></span>
                </button>
              </div>

              <form onSubmit={submit} className="auth-form">
                {mode==='signup'&&<label>Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>}
                <label>Email<input autoFocus={mode==='signin'} required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" /></label>
                <label className="remember"><input id="remember-me" type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} aria-describedby="remember-help"/><span><b>Keep me signed in</b><small id="remember-help">Keeps this device signed in for up to 400 days.</small></span></label>
                {error&&<div className="auth-error" role="alert"><Icon name="shield" size={15}/>{error}</div>}
                <button className="btn dark full auth-submit" type="submit" disabled={busy}>{busy?'Sending secure message…':mode==='signup'?'Create my account':method==='otp'?'Send code':'Send sign-in link'}<Icon name="arrow" size={17}/></button>
              </form>
              <div className="auth-trust"><span><Icon name="shield" size={14}/>Passwordless</span><span><Icon name={method==='otp'?'shield':'mail'} size={14}/>{method==='otp'?'6-digit code':'One-tap link'}</span><span><Icon name="map" size={14}/>Campus-first</span></div>
            </motion.div>}
          </AnimatePresence>
        </div>
        <p className="auth-legal">By continuing, you agree to use CarryGo responsibly and follow the delivery rules shown in the app.</p>
      </MotionPage>
    </div>
  </main>;
}
