export const CAMPUS_ID = '00000000-0000-0000-0000-000000000001';
export const ROOM_PREMIUM_KOBO = 15000;
export const SERVICE_FEE_PERCENT = 5;
export const SERVICE_FEE_MIN_KOBO = 2000;
export const SERVICE_FEE_CAP_KOBO = 15000;
export function serviceFee(feeKobo: number) {
  return Math.min(SERVICE_FEE_CAP_KOBO, Math.max(SERVICE_FEE_MIN_KOBO, Math.round(feeKobo * SERVICE_FEE_PERCENT / 100)));
}
export function applyDiscount(amount: number, pct: number) {
  const p = Math.max(0, Math.min(100, pct));
  return Math.max(0, Math.round(amount * (100 - p) / 100));
}
export function naira(kobo: number) {
  return '₦' + Math.max(0, kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}
