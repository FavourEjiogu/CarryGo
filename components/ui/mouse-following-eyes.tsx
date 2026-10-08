"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface EyeProps {
  mouseX:number; mouseY:number;
  selfRef:React.RefObject<HTMLDivElement|null>;
  otherRef:React.RefObject<HTMLDivElement|null>;
  closed:boolean;
}

const Eye:React.FC<EyeProps>=({mouseX,mouseY,selfRef,otherRef,closed})=>{
 const pupilRef=useRef<HTMLDivElement>(null);
 const[center,setCenter]=useState({x:0,y:0});
 const updateCenter=React.useCallback(()=>{if(!selfRef.current)return;const r=selfRef.current.getBoundingClientRect();setCenter({x:r.left+r.width/2,y:r.top+r.height/2})},[selfRef]);
 useEffect(()=>{updateCenter();window.addEventListener("resize",updateCenter);return()=>window.removeEventListener("resize",updateCenter)},[updateCenter]);
 useEffect(()=>{if(closed||!pupilRef.current)return;const inside=(ref:React.RefObject<HTMLDivElement|null>)=>{const r=ref.current?.getBoundingClientRect();return !!r&&mouseX>=r.left&&mouseX<=r.right&&mouseY>=r.top&&mouseY<=r.bottom};if(inside(selfRef)||inside(otherRef))return;const angle=Math.atan2(mouseY-center.y,mouseX-center.x);const maxMove=20;pupilRef.current.style.transform="translate("+Math.cos(angle)*maxMove+"px,"+Math.sin(angle)*maxMove+"px)"},[closed,mouseX,mouseY,center,otherRef,selfRef]);
 return <div ref={selfRef} className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-white shadow-sm" aria-hidden="true"><div ref={pupilRef} className="absolute h-8 w-8 rounded-full bg-black transition-[opacity,transform] duration-100" style={{opacity:closed?0:1}}><div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-white"/></div>{closed&&<span className="absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 rotate-[-8deg] rounded-full bg-black"/></div>
};

interface MouseFollowingEyesProps{className?:string;closed?:boolean;}
const MouseFollowingEyes:React.FC<MouseFollowingEyesProps>=({className="",closed=false})=>{
 const[mousePos,setMousePos]=useState({x:0,y:0});
 const eye1Ref=useRef<HTMLDivElement>(null),eye2Ref=useRef<HTMLDivElement>(null);
 const handleMouseMove=(e:React.MouseEvent<HTMLDivElement>)=>setMousePos({x:e.clientX,y:e.clientY});
 return <div className={"desktop-eyes-only flex items-center justify-center rounded-xl "+className} onMouseMove={handleMouseMove} aria-hidden="true"><div className="flex -space-x-2"><Eye mouseX={mousePos.x} mouseY={mousePos.y} selfRef={eye1Ref} otherRef={eye2Ref} closed={closed}/><Eye mouseX={mousePos.x} mouseY={mousePos.y} selfRef={eye2Ref} otherRef={eye1Ref} closed={closed}/></div></div>
};
export{MouseFollowingEyes};