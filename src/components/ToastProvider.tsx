"use client";
import*as React from"react";import{AnimatePresence,motion}from"motion/react";import{CheckCircle2,Info,TriangleAlert,X}from"lucide-react";
type ToastKind="success"|"error"|"info";
type Toast={id:number;kind:ToastKind;title:string;body?:string};
const ToastContext=React.createContext<{toast:(title:string,body?:string,kind?:ToastKind)=>void}>({toast:()=>{}});
let seq=0;
export function ToastProvider({children}:{children:React.ReactNode}){const[items,setItems]=React.useState<Toast[]>([]);const toast=React.useCallback((title:string,body?:string,kind:ToastKind="info")=>{const id=++seq;setItems(v=>[...v,{id,kind,title,body}].slice(-4));window.setTimeout(()=>setItems(v=>v.filter(x=>x.id!==id)),4200)},[]);return <ToastContext.Provider value={{toast}}>{children}<div className="toast-stack" aria-live="polite" aria-atomic="true"><AnimatePresence>{items.map(item=><motion.div key={item.id} initial={{opacity:0,y:18,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,x:20}} className={"toast toast-"+item.kind}><span className="toast-icon">{item.kind==="success"?<CheckCircle2/>:item.kind==="error"?<TriangleAlert/>:<Info/>}</span><div><b>{item.title}</b>{item.body&&<p>{item.body}</p>}</div><button type="button" onClick={()=>setItems(v=>v.filter(x=>x.id!==item.id))} aria-label="Dismiss"><X/></button></motion.div>)}</AnimatePresence></div></ToastContext.Provider>}
export const useToast=()=>React.useContext(ToastContext);
