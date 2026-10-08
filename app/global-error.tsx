'use client';

export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <html lang="en"><body style={{margin:0,background:'#f3f3ed',color:'#0b0d0c',fontFamily:'ui-sans-serif,system-ui,sans-serif'}}>
   <main style={{minHeight:'100dvh',display:'grid',placeItems:'center',padding:24}}>
     <section style={{width:'min(560px,100%)',padding:28,border:'1px solid #d9d9d0',borderRadius:24,background:'#fffef9'}}>
       <p style={{fontSize:10,fontWeight:900,letterSpacing:'.12em',color:'#6d7069'}}>CARRYGO</p>
       <h1 style={{fontSize:'clamp(42px,8vw,70px)',lineHeight:'.95',letterSpacing:'-.07em'}}>We hit a <span style={{color:'#8b67ff'}}>hard stop.</span></h1>
       <p style={{color:'#6d7069',lineHeight:1.6}}>The application hit an unexpected error. Nothing else is required from you.</p>
       <button onClick={reset} style={{minHeight:44,padding:'11px 15px',borderRadius:14,border:'1px solid #0b0d0c',background:'#0b0d0c',color:'#fff',fontWeight:900,cursor:'pointer'}}>Try again</button>
     </section>
   </main>
 </body></html>
}
