'use client';

import Link from 'next/link';

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: RouteErrorProps) {
  return (
    <main className="center shell">
      <section className="card success narrow" role="alert" aria-labelledby="route-error-title">
        <div className="eyebrow">SOMETHING WOBBLED</div>
        <h1 id="route-error-title" className="app-title">
          That didn’t go <em>quite right.</em>
        </h1>
        <p className="sub">
          The page hit an unexpected problem. Try again, or head back to CarryGo.
        </p>
        {error.digest && <p className="hint">Reference code: {error.digest}</p>}
        <div className="actions">
          <button type="button" className="btn dark" onClick={() => reset()}>
            Try again
          </button>
          <Link className="btn ghost" href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
