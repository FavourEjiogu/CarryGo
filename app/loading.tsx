export default function Loading(){
  return <main className="loading-screen" aria-busy="true" aria-live="polite">
    <div className="loading-orbit loading-orbit-one" aria-hidden="true"/>
    <div className="loading-orbit loading-orbit-two" aria-hidden="true"/>
    <div className="auth-loading">
      <div className="loading-brand-row"><span className="brand"><i className="brand-dot"/>CarryGo</span><span className="loading-code">01 / READY</span></div>
      <div className="loading-mark" aria-hidden="true"><span className="brand-dot"/><i/><i/></div>
      <p className="loading-title">Getting things <em>moving.</em></p>
      <p className="loading-sub">Preparing your campus space…</p>
      <div className="loader-line" aria-hidden="true"><span/></div>
      <div className="loading-dots" aria-hidden="true"><i/><i/><i/></div>
    </div>
  </main>
}
