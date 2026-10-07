'use client';
import {useEffect,useRef,useState} from'react';
import {suggestPlaces,type PlaceSuggestion} from'@/src/lib/place-data';

type Props={label:string;value:string;onChange:(value:string)=>void;onSelect?:(place:PlaceSuggestion)=>void;placeholder?:string};

export function LocationField({label,value,onChange,onSelect,placeholder}:Props){
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const items=suggestPlaces(value);
  useEffect(()=>{const close=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
  return <div className="field-wrap" ref={ref}>
    <label>{label}
      <input value={value} onFocus={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);setOpen(true)}} placeholder={placeholder}/>
    </label>
    {open&&items.length>0&&<div className="suggestions" role="listbox">
      {items.map(item=><button type="button" key={item.label} className="suggestion" onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(item.label);onSelect?.(item);setOpen(false)}}>
        <span className="suggestion-mark"/><span><b>{item.label}</b><small>{item.kind}</small></span>
      </button>)}
    </div>}
  </div>;
}
