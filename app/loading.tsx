export default function Loading(){
  return <main className="center app-loading" aria-busy="true" aria-live="polite">
    <div className="auth-loading loading-mark">
      <span className="brand" aria-label="CarryGo"><i className="brand-dot" aria-hidden="true"/>CarryGo</span>
      <div className="loading-orbit" aria-hidden="true"><i/><i/><i/></div>
      <div className="loader-line" role="progressbar" aria-label="Loading CarryGo"/>
      <span className="loading-caption">Getting things ready.</span>
    </div>
  </main>
}
