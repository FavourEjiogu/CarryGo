'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {AppShell} from '@/src/components/AppShell';
import {campusNodes} from '@/src/lib/campus-graph';
import {hostelPlaces,merchantPlaces} from '@/src/lib/bingham';

type Campus={id:string;name:string;city?:string|null;state?:string|null};
type Location={id:string;name:string;location_type:string};

export default function Campus(){
 const[profile,setProfile]=useState<any>(null),[campus,setCampus]=useState<Campus|null>(null),[locations,setLocations]=useState<Location[]>([]),[error,setError]=useState('');
 useEffect(()=>{Promise.all([fetch('/api/me',{cache:'no-store'}),fetch('/api/campuses',{cache:'no-store'}),fetch('/api/locations',{cache:'no-store'})]).then(async([m,c,l])=>{const mj=await m.json(),cj=await c.json(),lj=await l.json();if(!m.ok)throw new Error(mj.error||'Sign in required');setProfile(mj.profile);setCampus((cj.campuses||[]).find((x:Campus)=>x.id===mj.profile?.campus_id)||null);setLocations(lj.locations||[])}).catch(e=>setError(e instanceof Error?e.message:'Could not load your campus.'))},[]);
 const isBingham=/bingham/i.test(campus?.name||'');
 const hostels=useMemo(()=>locations.filter(x=>x.location_type==='HOSTEL'||x.location_type==='ROOM').length,[locations]);
 const food=useMemo(()=>locations.filter(x=>['FOOD','MERCHANT','SHOP'].includes(x.location_type)).length,[locations]);
 if(error)return <AppShell><main className="shell page-pad narrow"><div className="card form"><h2>{error}</h2><Link href="/login" className="btn dark">Sign in →</Link></div></main></AppShell>;
 return <AppShell><main className="shell page-pad">
  <div className="pill">{campus?.name||'YOUR CAMPUS'}{campus?.city?' · '+campus.city:''}</div>
  <h1>Campus, <em>without the bloat.</em></h1>
  <p className="lead">Students already know where things are. CarryGo keeps location input human — type it, confirm, move.</p>
  {isBingham ? <><div className="campus-map card big-map" aria-label="Bingham pilot campus network map">{campusNodes.map(x=><div className="node" key={x.id} style={{left:x.x+'%',top:x.y+'%'}}><span/>{x.label}</div>)}<div className="moving big">CG</div></div><div className="map-note">Pilot network · {hostelPlaces.length} named hostel points + {merchantPlaces.length} known merchant points.</div></> :
   <div className="card feature campus-map-empty"><small>LOCAL NETWORK</small><h2>{locations.length||0} named place{locations.length===1?'':'s'} ready.</h2><p>This campus is data-driven. Add more places and merchants as the local network grows; free-text locations always remain available.</p></div>}
  <div className="grid2">
   <div className="card feature"><small>RESIDENTIAL</small><h2>{isBingham?hostelPlaces.length:hostels} hostel point{(isBingham?hostelPlaces.length:hostels)===1?'':'s'}.</h2><p>Typed campus places keep delivery simple without making a live map a requirement.</p></div>
   <div className="card feature"><small>FOOD + COMMERCE</small><h2>{isBingham?merchantPlaces.length:food} food / commerce point{(isBingham?merchantPlaces.length:food)===1?'':'s'}.</h2><p>Known merchants can grow with the campus directory.</p></div>
  </div>
  <div className="actions"><Link className="btn dark" href="/do">Post a task</Link><Link className="btn purple" href="/merchants">Merchant network</Link></div>
 </main></AppShell>
}
