import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCampusPlace } from './place-resolution';

const places = [
  { label: 'Green Plaza', locationId: '1', kind: 'Food' },
  { label: 'Grand Hall', locationId: '2', kind: 'Landmark' },
];

test('resolves exact and common abbreviation variants', () => {
  assert.equal(resolveCampusPlace('green plz', places)?.place.label, 'Green Plaza');
  assert.equal(resolveCampusPlace('G Plaza', places)?.place.label, 'Green Plaza');
});

test('rejects ambiguous or weak matches', () => {
  assert.equal(resolveCampusPlace('hall', places), null);
});
