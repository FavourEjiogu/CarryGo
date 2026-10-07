'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/src/components/icons';
import { MotionPage } from '@/src/components/MotionPage';

type Profile=Record<string,any>;
type Campus={id:string;name:string;city?:string|null;state?:string|null;country_code?:string|null};

export default function Onboarding() {
  const router=useRouter();
  const [step,setStep]=useState(1);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [campuses,setCampuses]=useState<Campus[]>([]);
  const [campusId,setCampusId]=useState('');
  const [campusQuery,setCampusQuery]=useState('');
  const [campusOpen,setCampusOpen]=useState(false);
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
      if(pending){try{const p=JSON.parse(pending);if(typeof p.name==='string')setName(p.name)}catch{}}
      try{
        const [meResponse,academicResponse,campusResponse]=await Promise.all([fetch('/api/me'),fetch('/api/academic'),fetch('/api/campuses')]);
        const m=await meResponse.json(),a=await academicResponse.json(),c=await campusResponse.json();
        if(!meResponse.ok||!m?.profile)throw new Error(m.error||'Sign in required');
        setProfile(m.profile);setName(v=>v||m.profile.display_name||'');setPhone(m.profile.phone_number||'');setCampusId(m.profile.campus_id||'');
        setFacultyId(m.profile.faculty_id||'');setDepartmentId(m.profile.department_id||'');setGender(m.profile.gender||'UNSPECIFIED');
        setCampuses(c.campuses||[]);setFaculties(a.faculties||[]);setDepartments(a.departments||[]);
        const selected=(c.campuses||[]).find((x:Campus)=>x.id===m.profile.campus_id);if(selected)setCampusQuery(selected.name+(selected.city?' · '+selected.city:''));
      }catch(e){setError(e instanceof Error?e.message:'Could not load your account.')}
    });
  },[]);

  const visibleDepartments=useMemo(()=>departments.filter(d=>!facultyId||d.faculty_id===facultyId),[departments,facultyId]);
  const visibleCampuses=useMemo(()=>{
    const q=campusQuery.trim().toLowerCase();
    const list=q?campuses.filter(c=>(c.name+' '+(c.city||'')+' '+(c.state||'')).toLowerCase().includes(q)):campuses;
    return list.slice(0,8);
  },[campuses,campusQuery]);
  const selectedCampus=campuses.find(c=>c.id===campusId);

  async function finish(e:FormEvent) {
    e.preventDefault();setError('');
    if(step===1){
      if(name.trim().length<2){setError('Tell us your name first.');return}
      if(!/^(?:\+234|0)[789]\d{9}$/.test(phone.replace(/\s+/g,''))){setError('Enter a valid Nigerian mobile number.');return}
      setStep(2);return;
    }
    if(!campusId){setError('Choose your school or campus first.');return}
    setBusy(true);
    try{
      const r=await fetch('/api/profile',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({
        display_name:name.trim(),phone_number:phone.replace(/\s+/g,''),gender,campus_id:campusId,faculty_id:facultyId||null,department_id:departmentId||null
      })});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not finish your profile.');
      localStorage.removeItem('cg:pending-signup');router.replace('/');
    }catch(e){setError(e instanceof Error?e.message:'Could not finish your profile.')}finally{setBusy(false)}
  }

  if(!profile&&!error)return <main className="auth-page"><div className="auth-loading"><span className="brand"><i className="brand-dot"/>CarryGo</span><div className="loader-line"/></div></main>;

  return <main className="auth-page onboarding-page">
    <div className="auth-orbit auth-orbit-one" aria-hidden="true"/><div className="auth-orbit auth-orbit-two" aria-hidden="true"/>
    <MotionPage className="auth-frame onboarding-frame">
      <header className="auth-top"><span className="brand"><i className="brand-dot"/>CarryGo</span><span className="auth-step">STEP {step} OF 2</span></header>
      <div className="onboarding-progress" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step}><motion.i animate={{width:step===1?'50%':'100%'}}/></div>
      <div className="onboarding-intro">
        <div className="pill"><Icon name="shield" size={14}/> Built around your campus account</div>
        <h1>{step===1?<>Let’s make CarryGo <em>yours.</em></>:<>Choose where CarryGo <em>lives.</em></>}</h1>
        <p>{step===1?'Your name and mobile number help runners know who to hand over to.':'Pick your school first. We use it to show the right places, people and local marketplace. The other fields can wait.'}</p>
      </div>
      <form className="onboarding-form" onSubmit={finish}>
        <AnimatePresence mode="wait">
          {step===1 ? <motion.div key="one" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:.2}}>
            <label>Your name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Favour Ejiogu" autoComplete="name"/></label>
            <label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="0801 234 5678" autoComplete="tel"/></label>
            <div className="auth-assurance"><Icon name="shield" size={16}/><span>Used for your account and delivery coordination, not displayed as a public profile field.</span></div>
            <button className="btn dark full" type="submit">Choose my campus <Icon name="arrow" size={16}/></button>
          </motion.div> :
          <motion.div key="two" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:.2}}>
            <div className="campus-picker">
              <label htmlFor="campus-search">School / campus</label>
              <div className="campus-search-wrap">
                <Icon name="search" size={17}/>
                <input id="campus-search" autoFocus value={campusQuery} onChange={e=>{setCampusQuery(e.target.value);setCampusOpen(true)}} onFocus={()=>setCampusOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setCampusOpen(false)}} placeholder="Search your school…" role="combobox" aria-expanded={campusOpen&&visibleCampuses.length>0} aria-controls="campus-options" aria-autocomplete="list" />
              </div>
              {selectedCampus&&<div className="locked-campus"><span><Icon name="check" size={12}/> SELECTED</span><b>{selectedCampus.name}</b><small>{[selectedCampus.city,selectedCampus.state].filter(Boolean).join(' · ')}</small></div>}
              {campusOpen&&visibleCampuses.length>0&&<div className="campus-options" id="campus-options" role="listbox" aria-label="Available schools">
                {visibleCampuses.map(c=><button type="button" key={c.id} className={campusId===c.id?'campus-option selected':'campus-option'} role="option" aria-selected={campusId===c.id} onClick={()=>{setCampusId(c.id);setCampusQuery(c.name+(c.city?' · '+c.city:''));setCampusOpen(false);setFacultyId('');setDepartmentId('')}}><span className="campus-option-mark"/><span><b>{c.name}</b><small>{[c.city,c.state].filter(Boolean).join(' · ')||'Nigeria'}</small></span><Icon name={campusId===c.id?'check':'chevron'} size={15}/></button>)}
              </div>}
              {campusOpen&&visibleCampuses.length===0&&<div className="campus-empty" role="status">No matching campus yet. Try the full school name.</div>}
            </div>
            <div className="auth-assurance"><Icon name="map" size={16}/><span>Your campus controls local places and marketplace context. We keep your school choice tied to your account.</span></div>
            <label>Faculty <span className="muted-inline">optional</span><select value={facultyId} onChange={e=>{setFacultyId(e.target.value);setDepartmentId('')}}><option value="">Choose later</option>{faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
            <label>Department <span className="muted-inline">optional</span><select value={departmentId} onChange={e=>setDepartmentId(e.target.value)}><option value="">Choose later</option>{visibleDepartments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
            <label>Gender <span className="muted-inline">optional</span><select value={gender} onChange={e=>setGender(e.target.value)}><option value="UNSPECIFIED">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></label>
            <div className="auth-assurance"><Icon name="shield" size={16}/><span>Gender is private and only matters for same-gender room delivery.</span></div>
            {error&&<div className="error" role="alert" aria-live="polite">{error}</div>}
            <button className="btn dark full" type="submit" disabled={busy}>{busy?'Finishing…':'Enter CarryGo'}</button>
            <button className="btn ghost full" type="button" onClick={()=>{setError('');setStep(1)}} disabled={busy}>Back</button>
          </motion.div>}
        </AnimatePresence>
        {step===1&&error&&<div className="error" role="alert" aria-live="polite">{error}</div>}
      </form>
      <p className="auth-footer">You can change your campus and profile details later.</p>
    </MotionPage>
  </main>;
}