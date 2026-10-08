'use client';

import posthog from 'posthog-js';

type AnalyticsEvent =
  | 'auth verification requested'
  | 'auth verification completed'
  | 'onboarding step completed'
  | 'onboarding completed'
  | 'task route detected'
  | 'task route applied'
  | 'route suggestion applied';

type AnalyticsProperties = Record<string, string | number | boolean | null>;

const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const CONSENT_KEY = 'cg:analytics-consent:v1';
const CONSENT_COOKIE = 'cg_analytics_consent';
let initialized = false;

export function getAnalyticsConsent(): 'granted' | 'denied' | 'unset' {
  if (typeof window === 'undefined') return 'unset';
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

function setConsent(value: 'granted' | 'denied') {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {}
  document.cookie = CONSENT_COOKIE + '=' + value + '; Max-Age=31536000; Path=/; SameSite=Lax';
}

export function enableAnalyticsFromConsent() {
  if (typeof window === 'undefined' || !TOKEN || !HOST || initialized) return;
  if (getAnalyticsConsent() !== 'granted') return;
  posthog.init(TOKEN, {
    api_host: HOST,
    defaults: '2026-05-30',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: 'memory',
    respect_dnt: true,
  });
  initialized = true;
}

export function grantAnalyticsConsent() {
  if (typeof window === 'undefined') return;
  setConsent('granted');
  enableAnalyticsFromConsent();
}

export function denyAnalyticsConsent() {
  if (typeof window === 'undefined') return;
  setConsent('denied');
  if (initialized) posthog.opt_out_capturing();
}

export function track(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
): void {
  enableAnalyticsFromConsent();
  if (!initialized) return;
  posthog.capture(event, properties);
}
