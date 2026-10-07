import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount, serviceFee, ROOM_PREMIUM_KOBO } from './app-config';

test('service fee respects floor', () => assert.equal(serviceFee(100), 2000));
test('service fee is percentage-based in the normal range', () => assert.equal(serviceFee(50000), 2500));
test('service fee respects cap', () => assert.equal(serviceFee(1000000), 15000));
test('streak discount applies only to CarryGo service fee math', () => assert.equal(applyDiscount(2500, 40), 1500));
test('room premium is positive and separately represented', () => assert.equal(ROOM_PREMIUM_KOBO, 15000));
test('discount cannot become negative', () => assert.equal(applyDiscount(2500, 150), 0));
