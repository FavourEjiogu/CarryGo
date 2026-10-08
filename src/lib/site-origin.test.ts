import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_SITE_ORIGIN, getSiteOrigin } from './site-origin.ts';

const original = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

test.afterEach(() => {
  if (original.NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = original.NODE_ENV;
  if (original.NEXT_PUBLIC_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = original.NEXT_PUBLIC_SITE_URL;
  if (original.NEXT_PUBLIC_APP_URL === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = original.NEXT_PUBLIC_APP_URL;
});

test('uses the configured HTTPS origin in production', () => {
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://carrygo-chi.vercel.app/';
  delete process.env.NEXT_PUBLIC_APP_URL;

  assert.equal(getSiteOrigin('https://example.invalid'), 'https://carrygo-chi.vercel.app');
});

test('falls back to the canonical production origin when config is missing or unsafe', () => {
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  delete process.env.NEXT_PUBLIC_APP_URL;

  assert.equal(getSiteOrigin('http://localhost:3000'), DEFAULT_SITE_ORIGIN);
});

test('uses the request origin in development when no site URL is configured', () => {
  process.env.NODE_ENV = 'development';
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;

  assert.equal(getSiteOrigin('http://localhost:3000'), 'http://localhost:3000');
});
