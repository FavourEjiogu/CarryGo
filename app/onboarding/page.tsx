'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/src/components/icons';
import { MotionPage } from '@/src/components/MotionPage';

type Profile=Record<string,any>;

export default function Onboarding() {
  const router=useRouter();
  const [step,setStep]=useState(1);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [campuses,setCampuses]=useState<any[]>([]);
  const [campusId,setCampusId]=useState('');
  const [faculties,setFaculties]=useState<any[]>([]);
  const [departments,setDepartments]=useState<any[]>([]);
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [facultyId,setFacultyId]=useState('');
  const [departmentId,setDepartmentId]=useState('');
  const [gender,setGender]=useState('UNSPECIFIED');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    queueMicrotask(async()=>{
      const pending=localStorage.getItem('cg:pending-signup');
      if(pending){
        try{
          const p=JSON.parse(pending);
          if(typeof p.name==='string')setName(p.name);
        }catch{}
      }
      try{
        const [meResponse,academicResponse,campusResponse]=await Promise.all([fetch('/api/me'),fetch('/api/academic'),fetch('/api/campuses')]);
        const m=await meResponse.json();
        const a=await academicResponse.json();
        const c=await campusResponse.json();
        if(!meResponse.ok||!m?.profile)throw new Error(m.error||'Sign in required');
        setProfile(m.profile);
        setName(v=>v||m.profile.display_name||'');
        setPhone(m.profile.phone_number||'');
        setCampusId(m.profile.campus_id||'');
        setFacultyId(m.profile.faculty_id||'');
        setDepartmentId(m.profile.department_id||'');
        setGender(m.profile.gender||'UNSPECIFIED');
        setCampuses(c.campuses||[]);
        setFaculties(a.faculties||[]);
        setDepartments(a.departments||[]);
      }catch(e){setError(e instanceof Error?e.message:'Could not load your account.');}
    });
  },[]);

  const visibleDepartments=useMemo(()=>departments.filter(d=>!facultyId||d.faculty_id===facultyId),[departments,facultyId]);

  async function finish(e:FormEvent) {
    e.preventDefault();
    setError('');
    if(step===1){
      if(name.trim().length<2){setError('Tell us your name first.');return;}
      if(!/^(?:\+234|0)[789]\d{9}$/.test(phone.replace(/\s+/g,''))){setError('Enter a valid Nigerian mobile number.');return;}
      if(!campusId){setError('Choose your school or campus first.');return;} setStep(2);
      return;
    }
    setBusy(true);
    try{
      const r=await fetch('/api/profile',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({
        display_name:name.trim(),phone_number:phone.replace(/\s+/g,''),gender,campus_id:campusId,faculty_id:facultyId||null,department_id:departmentId||null
      })});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not finish your profile.');
      localStorage.removeItem('cg:pending-signup');
      router.replace('/');
    }catch(e){setError(e instanceof Error?e.message:'Could not finish your profile.');}
    finally{setBusy(false);}
  }

  if(!profile&&!error)return <main className="auth-page"><div className="auth-loading"><span className="brand"><i className="brand-dot"/>CarryGo</span><div className="loader-line"/></div></main>;

  return <main className="auth-page onboarding-page">
    <div className="auth-orbit" aria-hidden="true"/>
    <MotionPage className="auth-frame onboarding-frame">
      <header className="auth-top"><span className="brand"><i className="brand-dot"/>CarryGo</span><span className="auth-step">STEP {step} OF 2</span></header>
      <div className="onboarding-progress" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step}><motion.i animate={{width:step===1?'50%':'100%'}}/></div>
      <div className="onboarding-intro">
        <div className="pill"><Icon name="shield" size={14}/> Built around your campus account</div>
        <h1>{step===1?<>Let’s make CarryGo <em>yours.</em></>:<>Make it easier to <em>serve you.</em></>}</h1>
        <p>{step===1?'Your name and mobile number help runners know who to hand over to.':'These details stay minimal. Your campus determines the local marketplace; gender is only checked for same-gender room delivery.'}</p>
      </div>

      <form className="onboarding-form" onSubmit={finish}>
        <AnimatePresence mode="wait">
          {step===1 ? <motion.div key="one" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:.2}}>
            <label>Your name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Favour Ejiogu" autoComplete="name"/></label>
            <label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="0801 234 5678" autoComplete="tel"/></label>
            <div className="auth-assurance"><Icon name="shield" size={16}/><span>We only use your contact details for account and delivery coordination.</span></div>
            <button className="btn dark full" type="submit">Continue <Icon name="arrow" size={16}/></button>
          </motion.div> :
          <motion.div key="two" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:.2}}>
            <label>Your school / campus<select autoFocus value={campusId} onChange={e=>{setCampusId(e.target.value);setFacultyId('');setDepartmentId('')}} required><option value="">Choose your campus</option>{campuses.map(c=><option key={c.id} value={c.id}>{c.name}{c.city?' · '+c.city:''}</option>)}</select></label>
            <div className="auth-assurance"><Icon name="map" size={16}/><span>CarryGo adapts the marketplace, places and delivery rules to the campus you choose.</span></div>
            <label>Faculty <span className="muted-inline">optional</span><select value={facultyId} onChange={e=>{setFacultyId(e.target.value);setDepartmentId('')}}><option value="">Choose later</option>{faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
            <label>Department <span className="muted-inline">optional</span><select value={departmentId} onChange={e=>setDepartmentId(e.target.value)}><option value="">Choose later</option>{visibleDepartments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
            <label>Gender <span className="muted-inline">optional</span><select value={gender} onChange={e=>setGender(e.target.value)}><option value="UNSPECIFIED">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></label>
            <div className="auth-assurance"><Icon name="shield" size={16}/><span>Gender is not shown publicly. It only matters for same-gender room requests.</span></div>
            {error&&<div className="error" role="alert">{error}</div>}
            <button className="btn dark full" type="submit" disabled={busy}>{busy?'Finishing…': 'Enter CarryGo'}</button>
            <button className="btn ghost full" type="button" onClick={()=>setStep(1)} disabled={busy}>Back</button>
          </motion.div>}
        </AnimatePresence>
        {step===1&&error&&<div className="error">{error}</div>}
      </form>
      <p className="auth-footer">You can change these details later in Profile.</p>
    </MotionPage>
  </main>;
}
