'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

const CONSENT_KEY = 'cg:privacy-consent';
let initialised = false;

function syncConsent() {
  if (typeof window === 'undefined') return;
  const consent = window.localStorage.getItem(CONSENT_KEY);
  if (consent !== 'analytics') {
    if (initialised) posthog.opt_out_capturing();
    return;
  }
  if (window.navigator.doNotTrack === '1') return;
  if (initialised) {
    posthog.opt_in_capturing();
    return;
  }

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) return;

  posthog.init(token, {
    api_host: host,
    defaults: '2026-05-30',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: 'memory',
    respect_dnt: true,
    opt_out_capturing_by_default: true,
    consent_persistence_name: 'cg:posthog-consent',
  });
  posthog.opt_in_capturing();
  initialised = true;
}

export function AnalyticsBootstrap() {
  useEffect(() => {
    syncConsent();
    const handler = () => syncConsent();
    window.addEventListener('cg:privacy-consent', handler);
    return () => window.removeEventListener('cg:privacy-consent', handler);
  }, []);

  return null;
}
