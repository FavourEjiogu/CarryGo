'use client';

import { useEffect, useState } from 'react';
import { setAnalyticsConsent } from '@/src/lib/analytics';

const CONSENT_KEY = 'carrygo:privacy-consent:v1';
type Choice = 'granted' | 'denied' | 'unknown';

export function PrivacyControls() {
  const [choice, setChoice] = useState<Choice>('unknown');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(CONSENT_KEY);
        if (active) setChoice(stored === 'granted' ? 'granted' : stored === 'denied' ? 'denied' : 'unknown');
      } catch {
        if (active) setChoice('denied');
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  function choose(value: 'granted' | 'denied') {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // If storage is unavailable, analytics remains disabled by default.
    }
    setAnalyticsConsent(value === 'granted');
    setChoice(value);
  }

  return (
    <section className="card form" aria-labelledby="privacy-controls-title">
      <div>
        <div className="eyebrow">PRIVACY CHOICES</div>
        <h2 id="privacy-controls-title">Choose what CarryGo measures.</h2>
        <p className="sub">
          Essential app storage stays on to make CarryGo work. Optional product analytics is off unless you allow it. You can change this choice any time.
        </p>
      </div>
      <div className="chips" aria-live="polite">
        <span>Optional analytics: {choice === 'granted' ? 'On' : choice === 'denied' ? 'Off' : 'Not set'}</span>
      </div>
      <div className="actions">
        <button type="button" className={choice === 'denied' ? 'btn dark' : 'btn ghost'} aria-pressed={choice === 'denied'} onClick={() => choose('denied')}>
          Essential only
        </button>
        <button type="button" className={choice === 'granted' ? 'btn dark' : 'btn ghost'} aria-pressed={choice === 'granted'} onClick={() => choose('granted')}>
          Allow analytics
        </button>
      </div>
    </section>
  );
}
