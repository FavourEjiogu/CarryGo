"use client";
import * as React from "react";
import { useCallback,useEffect,useImperativeHandle,useRef,useState } from "react";
import { motion,useReducedMotion } from "motion/react";
export type OtpInputHandle={clear:()=>void;focus:()=>void};
export type OtpInputProps={length?:number;value?:string;defaultValue?:string;onChange?:(value:string)=>void;onComplete?:(value:string)=>void;status?:"idle"|"error"|"success";errorMessage?:string;successMessage?:string;hint?:string;disabled?:boolean;autoFocus?:boolean;className?:string;ref?:React.Ref<OtpInputHandle>};
export function OtpInput({length=6,value:controlled,defaultValue="",onChange,onComplete,status="idle",errorMessage="",successMessage="",hint="",disabled=false,autoFocus=false,className="",ref}:OtpInputProps){
 const controlledMode=controlled!==undefined;const [chars,setChars]=useState(()=>Array.from({length},(_,i)=>defaultValue[i]||""));
 const current=controlledMode?Array.from({length},(_,i)=>controlled[i]||""):chars;const refs=useRef<(HTMLInputElement|null)[]>([]);
 const commit=useCallback((next:string[])=>{if(!controlledMode)setChars(next);const v=next.join("");onChange?.(v);if(v.length===length)onComplete?.(v)},[controlledMode,length,onChange,onComplete]);
 const focus=useCallback((i:number)=>{refs.current[Math.max(0,Math.min(length-1,i))]?.focus()},[length]);
 const fill=useCallback((i:number,text:string)=>{const clean=text.replace(/\D/g,"").slice(0,length);if(!clean)return;const next=[...current];for(let j=0;j<clean.length&&i+j<length;j++)next[i+j]=clean[j];commit(next);focus(Math.min(length-1,i+clean.length))},[commit,current,focus,length]);
 useImperativeHandle(ref,()=>({clear:()=>{commit(Array.from({length},()=> ""));focus(0)},focus:()=>focus(0)}),[commit,focus,length]);
 useEffect(()=>{refs.current.length=length;if(autoFocus&&!disabled)focus(0)},[autoFocus,disabled,focus,length]);
 const reduce=useReducedMotion();const message=status==="error"?errorMessage:status==="success"?successMessage:hint;
 return <div className={"flex flex-col "+className}><div role="group" aria-label="Verification code" className="flex gap-2">
 {Array.from({length},(_,i)=>{const c=current[i]||"";return <div key={i} className="relative h-12 w-10"><input ref={el=>{refs.current[i]=el}} value={c} disabled={disabled} type="text" inputMode="numeric" autoComplete={i===0?"one-time-code":"off"} maxLength={length} aria-label={"Verification code "+(i+1)+" of "+length} aria-invalid={status==="error"} className={"h-12 w-10 rounded-xl border-2 bg-[var(--surface)] text-center text-lg font-bold outline-none focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(185,255,53,.22)] "+(status==="error"?"border-red-500":status==="success"?"border-emerald-500":"border-[var(--line)]")} onChange={e=>{const raw=e.currentTarget.value.replace(/\D/g,"");if(raw.length>1)fill(i,raw);else{const next=[...current];next[i]=raw;commit(next);if(raw)focus(i+1)}}} onKeyDown={e=>{if(e.key==="Backspace"&&!c){e.preventDefault();const next=[...current];if(i>0){next[i-1]="";commit(next);focus(i-1)}}else if(e.key==="ArrowLeft"){e.preventDefault();focus(i-1)}else if(e.key==="ArrowRight"){e.preventDefault();focus(i+1)}}} onPaste={e=>{e.preventDefault();fill(i,e.clipboardData.getData("text"))}} onFocus={e=>e.currentTarget.select()}/>{c&&<motion.span initial={reduce?false:{opacity:0,y:4}} animate={{opacity:1,y:0}} className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-lg">{c}</motion.span>}</div>})}</div>
 {message&&<div className={"mt-2 text-[10px] "+(status==="error"?"text-red-600":status==="success"?"text-emerald-600":"text-[var(--muted)]")}>{message}</div>}</div>
}
export default OtpInput;