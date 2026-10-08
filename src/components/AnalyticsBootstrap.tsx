'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

const CONSENT_KEY = 'cg:privacy-consent';

function initialise() {
  if (typeof window === 'undefined') return;
  if (window.navigator.doNotTrack === '1') return;
  if (window.localStorage.getItem(CONSENT_KEY) !== 'analytics') return;
  if (posthog.__loaded) return;

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
  });
}

export function AnalyticsBootstrap() {
  useEffect(() => {
    initialise();
    const handler = () => initialise();
    window.addEventListener('cg:privacy-consent', handler);
    return () => window.removeEventListener('cg:privacy-consent', handler);
  }, []);

  return null;
}
