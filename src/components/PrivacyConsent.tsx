'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/browser';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'cg:privacy-consent';
const publicRoutes = new Set(['/', '/login', '/faq', '/privacy', '/terms']);

export function PrivacyConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!publicRoutes.has(pathname)) {
      setVisible(false);
      return;
    }
    (async () => {
      const [{ data }] = await Promise.all([
        getSupabaseBrowserClient().auth.getSession(),
      ]);
      if (cancelled || data.session) {
        setVisible(false);
        return;
      }
      try {
        const hasChoice = localStorage.getItem(CONSENT_KEY) !== null || document.cookie.includes('cg_privacy_consent=');
        setVisible(!hasChoice);
      } catch {
        setVisible(true);
      }
    })();
    return () => { cancelled = true; };
  }, [pathname]);

  function choose(value: 'essential' | 'analytics') {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    document.cookie = 'cg_privacy_consent=' + value + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    setVisible(false);
    window.dispatchEvent(new Event('cg:privacy-consent'));
  }

  if (!visible || !publicRoutes.has(pathname)) return null;

  return (
    <aside className="privacy-consent" aria-label="Privacy choices">
      <div>
        <strong>Privacy, without the guesswork.</strong>
        <p>
          CarryGo needs essential session cookies to work. Optional analytics helps us improve the product and stays off until you choose it.
        </p>
      </div>
      <div className="privacy-consent-actions">
        <Link className="text-link" href="/privacy">Privacy details</Link>
        <button type="button" className="btn ghost" onClick={() => choose('essential')}>Only essential</button>
        <button type="button" className="btn dark" onClick={() => choose('analytics')}>Allow analytics</button>
      </div>
    </aside>
  );
}
