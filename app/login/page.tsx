'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/src/components/icons';
import { MotionPage } from '@/src/components/MotionPage';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/browser';

type Mode = 'signin' | 'signup';

const ERROR_COPY: Record<string,string> = {
  missing_code: 'That sign-in link is incomplete. Request a fresh one.',
  auth_failed: 'That link could not be verified. Request a fresh one and try again.',
};

export default function Login() {
  const [mode,setMode]=useState<Mode>('signin');
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
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
      const e=params.get('error');
      if(e)setError(ERROR_COPY[e]||'Something went wrong. Try again.');
    });
  },[]);

  useEffect(()=>{if(!seconds)return;const t=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(t)},[seconds]);

  const title=useMemo(()=>mode==='signup'?<>A better way to <em>get things done.</em></>:<>Welcome <em>back.</em></>,[mode]);

  async function sendLink(){
    setBusy(true);setError('');
    try{
      if(mode==='signup'&&name.trim().length<2){setError('Add your name so your account starts personal.');return;}
      const supabase=getSupabaseBrowserClient(remember);
      const site=(process.env.NEXT_PUBLIC_SITE_URL||window.location.origin).replace(/\/$/,'');
      const redirect=site+'/auth/callback?flow='+mode+'&remember='+(remember?'1':'0');
      const {error:authError}=await supabase.auth.signInWithOtp({
        email:email.trim().toLowerCase(),
        options:{emailRedirectTo:redirect,shouldCreateUser:mode==='signup'},
      });
      if(authError){setError(authError.message);return;}
      localStorage.setItem('cg:remember-me',remember?'1':'0');
      if(mode==='signup')localStorage.setItem('cg:pending-signup',JSON.stringify({name:name.trim(),email:email.trim().toLowerCase()}));
      setSent(true);setSeconds(30);
    }catch(e){setError(e instanceof Error?e.message:'Could not send your sign-in link.');}
    finally{setBusy(false)}
  }

  async function submit(e:FormEvent){e.preventDefault();if(!email.trim())return;await sendLink()}

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
            <button role="tab" aria-selected={mode==='signin'} className={mode==='signin'?'active':''} type="button" onClick={()=>{setMode('signin');setError('');setSent(false)}}>Sign in</button>
            <button role="tab" aria-selected={mode==='signup'} className={mode==='signup'?'active':''} type="button" onClick={()=>{setMode('signup');setError('');setSent(false)}}>Create account</button>
          </div>
          <AnimatePresence mode="wait">
            {sent ? <motion.div key="sent" className="auth-sent" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="mail-orb"><Icon name="mail" size={24}/></div>
              <span className="auth-kicker">LINK SENT</span>
              <h1>Check your <em>email.</em></h1>
              <p>We sent a secure one-time link to <b>{email.trim().toLowerCase()}</b>.</p>
              <div className="auth-sent-note"><Icon name="shield" size={16}/><span>No password to remember. The link expires, and your session stays on this device according to your setting.</span></div>
              <button className="btn dark full" type="button" disabled={seconds>0||busy} onClick={sendLink}>{seconds>0?'Resend in '+seconds+'s':'Resend link'}</button>
              <button className="btn ghost full" type="button" onClick={()=>setSent(false)}>Use a different email</button>
            </motion.div> : <motion.div key="form" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="auth-kicker">{mode==='signup'?'FIRST TIME HERE':'SIGN IN'}</div>
              <h1>{title}</h1>
              <p className="auth-sub">{mode==='signup'?'Start with your name and email. We’ll finish the useful bits after verification.':'Use your email. We’ll send a secure sign-in link — no password required.'}</p>
              <form onSubmit={submit} className="auth-form">
                {mode==='signup'&&<label>Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>}
                <label>Email<input autoFocus={mode==='signin'} required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" /></label>
                <label className="remember"><input id="remember-me" type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} aria-describedby="remember-help"/><span><b>Keep me signed in</b><small id="remember-help">Keeps this device signed in for up to 400 days.</small></span></label>
                {error&&<div className="auth-error" role="alert"><Icon name="shield" size={15}/>{error}</div>}
                <button className="btn dark full auth-submit" disabled={busy}>{busy?'Sending secure link…':mode==='signup'?'Create my account':'Send sign-in link'}<Icon name="arrow" size={17}/></button>
              </form>
              <div className="auth-trust"><span><Icon name="shield" size={14}/>Passwordless</span><span><Icon name="clock" size={14}/>Takes about a minute</span><span><Icon name="map" size={14}/>Campus-first</span></div>
            </motion.div>}
          </AnimatePresence>
        </div>
        <p className="auth-legal">By continuing, you agree to use CarryGo responsibly and follow the delivery rules shown in the app.</p>
      </MotionPage>
    </div>
  </main>;
}
