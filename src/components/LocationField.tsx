'use client';
import{useEffect,useMemo,useRef,useState}from'react';
import{resolveCampusPlace,type CampusPlace}from'@/src/lib/place-resolution';

export type PlaceSuggestion=CampusPlace;

async function loadPlaces():Promise<PlaceSuggestion[]>{
  const r=await fetch('/api/locations',{cache:'no-store'});
  if(!r.ok)return[];
  const j=await r.json();
  return(j.locations||[]).map((x:{id:string;name:string;location_type?:string;merchants?:Array<{id:string;name:string;category:string;verification_status:string;storefront_enabled:boolean;average_prep_minutes?:number|null}>})=>({
    label:x.name,
    locationId:x.id,
    kind:x.location_type==='HOSTEL'||x.location_type==='ROOM'?'Hostel':x.location_type==='FOOD'||x.location_type==='MERCHANT'||x.location_type==='SHOP'?'Food':x.location_type==='CAMPUS'?'Campus':'Landmark',
    merchant:x.merchants?.[0]?{id:x.merchants[0].id,name:x.merchants[0].name,category:x.merchants[0].category,verificationStatus:x.merchants[0].verification_status,storefrontEnabled:x.merchants[0].storefront_enabled,averagePrepMinutes:x.merchants[0].average_prep_minutes??null}:undefined,
  }));
}

export function LocationField({label,value,onChange,onSelect,placeholder}:{label:string;value:string;onChange:(v:string)=>void;onSelect?:(p:PlaceSuggestion)=>void;placeholder?:string}){
 const[open,setOpen]=useState(false),[places,setPlaces]=useState<PlaceSuggestion[]>([]),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{let live=true;loadPlaces().then(v=>{if(live)setPlaces(v)}).catch(()=>{});return()=>{live=false}},[]);
 useEffect(()=>{const f=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',f);return()=>document.removeEventListener('mousedown',f)},[]);
 const items=useMemo(()=>{const q=value.trim().toLowerCase();if(!q)return places.slice(0,8);return places.filter(p=>p.label.toLowerCase().includes(q)).slice(0,8)},[places,value]);
 const resolved=useMemo(()=>resolveCampusPlace(value,places),[value,places]);
 const choose=(p:PlaceSuggestion)=>{onChange(p.label);onSelect?.(p);setOpen(false)};
 return <div className="field-wrap" ref={ref}>
   <label>{label}
     <input value={value} onFocus={()=>setOpen(true)} onBlur={()=>{if(resolved&&resolved.confidence>=0.9)choose(resolved.place)}} onChange={e=>{onChange(e.target.value);setOpen(true)}} placeholder={placeholder} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={open&&items.length>0} aria-controls={label.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'-suggestions'}/>
   </label>
   {resolved&&resolved.confidence>=0.9&&resolved.place.label.toLowerCase()!==value.trim().toLowerCase()&&<small className="location-match">Matched to {resolved.place.label}</small>}
   {open&&items.length>0&&<div className="suggestions" role="listbox" id={label.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'-suggestions'} aria-label={label+' suggestions'}>
     {items.map(p=><button type="button" className="suggestion" key={p.locationId||p.label} role="option" aria-selected={value===p.label} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(p)}>
       <span className="suggestion-mark"/><span><b>{p.label}</b><small>{p.merchant?p.kind+' · '+p.merchant.category:p.kind}</small></span>
     </button>)}
   </div>}
 </div>
}
