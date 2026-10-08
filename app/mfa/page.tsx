'use client';
import{useEffect,useState}from"react";
import{useRouter,useSearchParams}from"next/navigation";
import Link from"next/link";
import{OtpInput}from"@/components/ui/otp-input";
import{getSupabaseBrowserClient}from"@/src/lib/supabase/browser";
export default function Mfa(){
 const router=useRouter();const params=useSearchParams();const nextValue=params.get("next");const next=nextValue&&nextValue.startsWith("/")&&!nextValue.startsWith("//")?nextValue:"/";
 const[loading,setLoading]=useState(true),[factorId,setFactorId]=useState(""),[code,setCode]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{(async()=>{const s=getSupabaseBrowserClient();const{data,error}=await s.auth.mfa.listFactors();if(error){setError(error.message);setLoading(false);return}const factor=data.totp.find((f:any)=>f.status==="verified")||data.phone.find((f:any)=>f.status==="verified");if(!factor){router.replace(next);return}setFactorId(factor.id);setLoading(false)})()},[next,router]);
 async function verify(){if(code.length!==6){setError("Enter the 6-digit authenticator code.");return}setBusy(true);setError("");const s=getSupabaseBrowserClient();const{data:challenge,error:ce}=await s.auth.mfa.challenge({factorId});if(ce){setBusy(false);setError(ce.message);return}const{error:ve}=await s.auth.mfa.verify({factorId,challengeId:challenge.id,code});setBusy(false);if(ve){setError("That code is incorrect or expired.");return}router.replace(next)}
 if(loading)return <main className="auth-page"><div className="auth-loading"><span className="brand"><i className="brand-dot"/>CarryGo</span><div className="loader-line"/></div></main>;
 return <main className="auth-page"><div className="auth-card card mfa-challenge"><div className="mail-orb"><span>2FA</span></div><div className="auth-kicker">SECOND STEP</div><h1>One more <em>proof.</em></h1><p className="auth-sub">Open your authenticator app and enter the current 6-digit code.</p><OtpInput autoFocus value={code} onChange={setCode} status={error?"error":"idle"} errorMessage={error} hint="Use the current code from your authenticator."/><button className="btn dark full" disabled={busy||code.length!==6} onClick={verify}>{busy?"Verifying…":"Verify and continue →"}</button><Link className="btn ghost full" href="/">Cancel</Link><p className="hint">Manage your authenticator in <Link className="text-link" href="/security">Security</Link>.</p></div></main>;
}