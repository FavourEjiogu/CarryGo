'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep runtime failure details out of the user interface.
    void error;
  }, [error]);

  return (
    <main className="center shell">
      <div className="card success narrow" role="alert">
        <div className="eyebrow">SOMETHING WOBBLED</div>
        <h1 className="app-title">That didn’t go <em>quite right.</em></h1>
        <p className="sub">Nothing is lost yet. Try the page again or head back to the CarryGo home screen.</p>
        <div className="actions">
          <button type="button" className="btn dark" onClick={() => reset()}>Try again</button>
          <Link className="btn ghost" href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}
