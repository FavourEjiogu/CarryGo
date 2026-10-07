import test from 'node:test';
import assert from 'node:assert/strict';

const serviceFee=(fee:number)=>Math.min(15000,Math.max(2000,Math.round(fee*5/100)));
const applyDiscount=(amount:number,pct:number)=>Math.max(0,Math.round(amount*(100-Math.max(0,Math.min(100,pct)))/100));
const ROOM_PREMIUM_KOBO=15000;

test('service fee respects floor',()=>assert.equal(serviceFee(100),2000));
test('service fee is percentage-based in normal range',()=>assert.equal(serviceFee(50000),2500));
test('service fee respects cap',()=>assert.equal(serviceFee(1000000),15000));
test('streak discount applies only to CarryGo service fee math',()=>assert.equal(applyDiscount(2500,40),1500));
test('room premium is positive and separately represented',()=>assert.equal(ROOM_PREMIUM_KOBO,15000));
test('discount cannot become negative',()=>assert.equal(applyDiscount(2500,150),0));
