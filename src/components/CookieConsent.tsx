'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/src/components/icons';
import { grantAnalyticsConsent, denyAnalyticsConsent, getAnalyticsConsent } from '@/src/lib/analytics';

export function CookieConsent({ enabled = true }: { enabled?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || getAnalyticsConsent() !== 'unset') return;
    try {
      if (sessionStorage.getItem('cg:cookie-banner-seen:v1') === '1') return;
      sessionStorage.setItem('cg:cookie-banner-seen:v1', '1');
    } catch {}
    setVisible(true);
  }, [enabled]);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    granted ? grantAnalyticsConsent() : denyAnalyticsConsent();
    setVisible(false);
  };

  return (
    <section className="cookie-consent" role="dialog" aria-label="Privacy choices" aria-live="polite">
      <div className="cookie-copy">
        <Icon name="shield" size={17} />
        <div>
          <b>One small privacy choice.</b>
          <p>
            CarryGo needs essential sign-in cookies. Optional product analytics stays off unless you allow it.
            See our <Link href="/privacy" className="text-link">privacy details</Link>.
          </p>
        </div>
      </div>
      <div className="cookie-actions">
        <button type="button" className="btn ghost" onClick={() => choose(false)}>Keep analytics off</button>
        <button type="button" className="btn dark" onClick={() => choose(true)}>Allow analytics</button>
      </div>
    </section>
  );
}
