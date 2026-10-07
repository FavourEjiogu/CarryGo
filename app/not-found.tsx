import Link from 'next/link';

export default function NotFound(){
  return <main className="center shell">
    <div className="card success narrow">
      <div className="pill">404 · NOT HERE</div>
      <h1 className="app-title">That page <em>moved.</em></h1>
      <p className="sub">The core CarryGo routes are still one tap away.</p>
      <Link className="btn dark" href="/">Back to CarryGo <span>→</span></Link>
    </div>
  </main>
}
