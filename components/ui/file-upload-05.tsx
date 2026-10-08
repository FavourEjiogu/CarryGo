"use client";
import{useCallback,useMemo,useRef,useState}from"react";
import{useDropzone}from"react-dropzone";
import{Check,ImageUp,RotateCw,Upload,ZoomIn}from"lucide-react";
import{Button}from"@/components/ui/button";
import{Card,CardContent}from"@/components/ui/card";
import{Slider}from"@/components/ui/slider";
import{cn}from"@/lib/utils";

const FRAME=208,OUT=320;
type Props={initialImageUrl?:string;onComplete?:(blob:Blob)=>void};
export default function FileUpload({initialImageUrl,onComplete}:Props){
 const[image,setImage]=useState(initialImageUrl||""),[zoom,setZoom]=useState([1]),[rotation,setRotation]=useState(0),[offset,setOffset]=useState({x:0,y:0}),[done,setDone]=useState(false),[natural,setNatural]=useState({w:0,h:0});
 const drag=useRef<{x:number;y:number;ox:number;oy:number}|null>(null);
 const load=useCallback((file?:File)=>{if(!file||!file.type.startsWith("image/")||file.size>3*1024*1024)return;const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{setNatural({w:img.naturalWidth,h:img.naturalHeight});setImage(url);setZoom([1]);setRotation(0);setOffset({x:0,y:0});setDone(false)};img.src=url},[]);
 const onDrop=useCallback((files:File[])=>load(files[0]),[load]);
 const dz=useDropzone({onDrop,multiple:false,accept:{"image/*":[".jpg",".jpeg",".png",".webp"]},noClick:true});
 const scale=useMemo(()=>natural.w&&natural.h?FRAME/Math.min(natural.w,natural.h):1,[natural]);
 const display=useMemo(()=>({w:natural.w*scale*zoom[0],h:natural.h*scale*zoom[0]}),[natural,scale,zoom]);
 function confirm(){if(!image)return;const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");canvas.width=OUT;canvas.height=OUT;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.save();ctx.beginPath();ctx.arc(OUT/2,OUT/2,OUT/2,0,Math.PI*2);ctx.clip();ctx.translate(OUT/2,OUT/2);ctx.rotate(rotation*Math.PI/180);ctx.translate(offset.x*OUT/FRAME,offset.y*OUT/FRAME);ctx.scale(scale*zoom[0]*OUT/FRAME,scale*zoom[0]*OUT/FRAME);ctx.drawImage(img,-natural.w/2,-natural.h/2);ctx.restore();canvas.toBlob(blob=>{if(blob){onComplete?.(blob);setDone(true)}}, "image/png")} ;img.src=image}
 const reset=()=>{if(image&&!image.startsWith("http"))URL.revokeObjectURL(image);setImage("");setDone(false);setRotation(0);setZoom([1]);setOffset({x:0,y:0})};
 return <Card className="w-full max-w-sm"><CardContent className="p-5">{!image?<div {...dz.getRootProps()} className="grid place-items-center gap-3 py-6 text-center"><input {...dz.getInputProps()}/><div className="grid size-16 place-items-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)]"><ImageUp className="size-5"/></div><b>{dz.isDragActive?"Drop it here":"Choose a profile photo"}</b><small className="text-[var(--muted)]">JPG, PNG or WebP · 3 MB max</small><Button type="button" variant="outline" onClick={dz.open}>Browse image</Button></div>:done?<div className="grid justify-items-center gap-3 py-5"><img src={canvasFallback(image)} alt="Profile preview" className="size-32 rounded-full object-cover"/><div className="flex items-center gap-2 text-emerald-600"><Check className="size-4"/>Photo ready</div><Button type="button" variant="outline" onClick={reset}>Choose another</Button></div>:<div className="grid gap-4"><div onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y}}} onPointerMove={e=>{if(!drag.current)return;setOffset({x:drag.current.ox+e.clientX-drag.current.x,y:drag.current.oy+e.clientY-drag.current.y})}} onPointerUp={()=>{drag.current=null}} className="mx-auto relative size-[208px] overflow-hidden rounded-full border-2 border-dashed border-[var(--line)] bg-[var(--paper)] touch-none"><img src={image} alt="Crop preview" draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none" style={{width:display.w,height:display.h,transform:"translate(-50%,-50%) translate("+offset.x+"px,"+offset.y+"px) rotate("+rotation+"deg)"}}/></div><div className="flex items-center gap-3"><ZoomIn className="size-4"/><Slider value={zoom} onValueChange={v=>setZoom(Array.isArray(v)?v:[v])} min={1} max={3} step={.01}/></div><div className="flex justify-between gap-2"><Button type="button" variant="outline" onClick={()=>setRotation(r=>(r+90)%360)}><RotateCw className="size-4"/>Rotate</Button><div className="flex gap-2"><Button type="button" variant="ghost" onClick={reset}>Cancel</Button><Button type="button" onClick={confirm}><Upload className="size-4"/>Use photo</Button></div></div></div>}</CardContent></Card>;
}
function canvasFallback(src:string){return src}
