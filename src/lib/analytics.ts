'use client';

import posthog from 'posthog-js';

type AnalyticsEvent =
  | 'auth verification requested'
  | 'auth verification completed'
  | 'onboarding step completed'
  | 'onboarding completed';

type AnalyticsProperties = Record<string, string | number | boolean | null>;

const enabled = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function track(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
): void {
  if (!enabled) return;
  posthog.capture(event, properties);
}
