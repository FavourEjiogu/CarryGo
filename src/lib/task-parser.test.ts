import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTaskRoute } from './task-parser.ts';

test('extracts natural-language pickup and destination', () => {
  assert.deepEqual(
    parseTaskRoute('Get 2 bottles of water from Green Plaza and bring them to Portfolio 214.'),
    { pickup: 'Green Plaza', destination: 'Portfolio 214', confidence: 'high' },
  );
});

test('extracts pickup and destination from a compact route', () => {
  assert.deepEqual(
    parseTaskRoute('Collect the documents from Senate and deliver to New Hostel.'),
    { pickup: 'Senate', destination: 'New Hostel', confidence: 'high' },
  );
});

test('extracts a simple from-to sentence', () => {
  assert.deepEqual(
    parseTaskRoute('Move the package from Green Plaza to Portfolio 214'),
    { pickup: 'Green Plaza', destination: 'Portfolio 214', confidence: 'medium' },
  );
});

test('ignores ambiguous text', () => {
  assert.equal(parseTaskRoute('Buy water for me'), null);
});
