'use client';
import Link from'next/link';

export default function Error({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <main className="shell page-pad center">
   <div className="card success narrow" role="alert">
     <div className="pill">SORRY · SOMETHING BROKE</div>
     <h1>Let’s get you <em>moving.</em></h1>
     <p className="lead">That screen hit an unexpected problem. Try it again or return home.</p>
     <div className="actions"><button className="btn dark" type="button" onClick={()=>reset()}>Try again</button><Link className="btn ghost" href="/">Back home</Link></div>
     {error.digest&&<span className="hint">Reference: {error.digest}</span>}
   </div>
 </main>
}
