'use client';

import { useEffect, useState } from 'react';

const KEY = 'cg:privacy-consent';

export function PrivacyControls() {
  const [choice, setChoice] = useState<'essential' | 'analytics' | 'unknown'>('unknown');

  useEffect(() => {
    try {
      const value = localStorage.getItem(KEY);
      if (value === 'essential' || value === 'analytics') setChoice(value);
    } catch {}
  }, []);

  function setConsent(value: 'essential' | 'analytics') {
    try { localStorage.setItem(KEY, value); } catch {}
    document.cookie = 'cg_privacy_consent=' + value + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    setChoice(value);
    window.dispatchEvent(new Event('cg:privacy-consent'));
  }

  return (
    <section className="privacy-controls card" aria-labelledby="privacy-controls-title">
      <div>
        <small>PRIVACY CHOICES</small>
        <h2 id="privacy-controls-title">Choose what CarryGo remembers.</h2>
        <p className="sub">Essential session storage stays on because it is needed to operate the account. Optional product analytics can be turned on or off here.</p>
      </div>
      <div className="privacy-controls-state" aria-live="polite">
        <span>Optional analytics</span>
        <strong>{choice === 'analytics' ? 'On' : choice === 'essential' ? 'Off' : 'Not chosen'}</strong>
      </div>
      <div className="actions">
        <button type="button" className={choice === 'essential' ? 'btn dark' : 'btn ghost'} onClick={() => setConsent('essential')}>Only essential</button>
        <button type="button" className={choice === 'analytics' ? 'btn dark' : 'btn ghost'} onClick={() => setConsent('analytics')}>Allow analytics</button>
      </div>
    </section>
  );
}
