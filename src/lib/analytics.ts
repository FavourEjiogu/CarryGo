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

export function initializeAnalytics():void{
  if(initialized) return;
  const token=process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host=process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if(!token||!host||typeof window==='undefined') return;
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
  if(granted) initializeAnalytics();
}

export function track(event:AnalyticsEvent,properties:AnalyticsProperties={}):void{
  if(!initialized) return;
  posthog.capture(event,properties);
}
