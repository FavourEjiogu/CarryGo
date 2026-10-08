export default function Loading(){
  return <main className="center loading-surface" aria-label="Loading CarryGo">
    <div className="auth-loading loading-brand-lockup">
      <div className="loading-mark" aria-hidden="true"><span/><i/><b/></div>
      <span className="brand"><i className="brand-dot"/>CarryGo</span>
      <div className="loader-line" role="progressbar" aria-label="Loading CarryGo" />
      <p>Getting your campus ready.</p>
    </div>
  </main>
}
