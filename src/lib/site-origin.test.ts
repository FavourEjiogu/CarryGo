import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_SITE_ORIGIN, getSiteOrigin } from './site-origin.ts';

const env = process.env as Record<string, string | undefined>;
const original = {
  NODE_ENV: env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
};

test.afterEach(() => {
  if (original.NODE_ENV === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = original.NODE_ENV;
  if (original.NEXT_PUBLIC_SITE_URL === undefined) delete env.NEXT_PUBLIC_SITE_URL;
  else env.NEXT_PUBLIC_SITE_URL = original.NEXT_PUBLIC_SITE_URL;
  if (original.NEXT_PUBLIC_APP_URL === undefined) delete env.NEXT_PUBLIC_APP_URL;
  else env.NEXT_PUBLIC_APP_URL = original.NEXT_PUBLIC_APP_URL;
});

test('uses the configured HTTPS origin in production', () => {
  env.NODE_ENV = 'production';
  env.NEXT_PUBLIC_SITE_URL = 'https://carrygo-chi.vercel.app/';
  delete env.NEXT_PUBLIC_APP_URL;

  assert.equal(getSiteOrigin('https://example.invalid'), 'https://carrygo-chi.vercel.app');
});

test('falls back to the canonical production origin when config is missing or unsafe', () => {
  env.NODE_ENV = 'production';
  env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  delete env.NEXT_PUBLIC_APP_URL;

  assert.equal(getSiteOrigin('http://localhost:3000'), DEFAULT_SITE_ORIGIN);
});

test('uses the request origin in development when no site URL is configured', () => {
  env.NODE_ENV = 'development';
  delete env.NEXT_PUBLIC_SITE_URL;
  delete env.NEXT_PUBLIC_APP_URL;

  assert.equal(getSiteOrigin('http://localhost:3000'), 'http://localhost:3000');
});
