'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/src/lib/supabase/browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const result = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/auth/callback', shouldCreateUser: true },
    });
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    setSent(true);
  }
  return <main className="shell page-pad narrow">
    <Link href="/" className="brand">CarryGo</Link>
    <div className="card form auth-card">
      {sent ? <><div className="success-icon">✓</div><h2>Check your email.</h2><p className="lead">Your one-time sign-in link is on its way.</p></>
        : <><div className="pill">BINGHAM KARU · SIGN IN</div><h1>Back to <em>business.</em></h1><p className="lead">Email link. No password. No fuss.</p>
          <form onSubmit={submit}><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>{error&&<div className="error">{error}</div>}<button className="btn dark full" disabled={busy}>{busy?'Sending…':'Send sign-in link →'}</button></form></>}
    </div>
  </main>;
}
