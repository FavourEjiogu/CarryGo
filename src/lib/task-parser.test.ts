import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTaskRoute } from './task-parser';

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

test('extracts the structured task fields', async () => {
  const { parseTask, suggestedTaskTitle } = await import('./task-parser');
  const parsed = parseTask('Get 2 bottles of water from Green Plaza and bring them to Portfolio 214 by 6pm.');
  assert.equal(parsed?.item, 'water');
  assert.equal(parsed?.quantity, 2);
  assert.equal(parsed?.pickup, 'Green Plaza');
  assert.equal(parsed?.destination, 'Portfolio 214');
  assert.equal(parsed?.timingText, 'by 6pm');
  assert.equal(parsed?.category, 'BUY_AND_BRING');
  assert.equal(parsed?.confidence, 'high');
  assert.equal(suggestedTaskTitle(parsed), 'Get 2 × water');
});

test('recognizes delivery type from natural language', async () => {
  const { parseTask } = await import('./task-parser');
  assert.equal(parseTask('Bring my charger from Senate to room 214')?.deliveryType, 'ROOM');
});
