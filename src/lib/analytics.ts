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

let initialized=false;
const CONSENT_KEY='carrygo:privacy-consent:v1';

function hasAnalyticsConsent():boolean{
  if(typeof window==='undefined') return false;
  try{return window.localStorage.getItem(CONSENT_KEY)==='granted'}catch{return false}
}

export function initializeAnalytics():void{
  if(initialized) return;
  const token=process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host=process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if(!token||!host||typeof window==='undefined'||!hasAnalyticsConsent()) return;
  initialized=true;
  posthog.init(token,{
    api_host:host,
    defaults:'2026-05-30',
    autocapture:false,
    capture_pageview:false,
    capture_pageleave:false,
    disable_session_recording:true,
    persistence:'memory',
    respect_dnt:true,
  });
}

export function setAnalyticsConsent(granted:boolean):void{
  if(!granted){if(initialized) posthog.opt_out_capturing();return;}
  if(!initialized){initializeAnalytics();return;}
  posthog.opt_in_capturing();
}

export function track(event:AnalyticsEvent,properties:AnalyticsProperties={}):void{
  if(!initialized||!hasAnalyticsConsent()) return;
  posthog.capture(event,properties);
}
