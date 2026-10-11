import test from "node:test";
import assert from "node:assert/strict";
import {
  estimateArrival,
  formatLocationAge,
  isLocationFresh,
  normalizeCoordinate,
} from "./delivery-tracking.ts";

test("normalizes numeric string coordinates", () => {
  assert.deepEqual(normalizeCoordinate({ latitude: "8.95", longitude: "7.70" }), {
    latitude: 8.95,
    longitude: 7.7,
  });
});

test("rejects missing and out-of-range coordinates", () => {
  assert.equal(normalizeCoordinate(null), null);
  assert.equal(normalizeCoordinate({ latitude: 91, longitude: 7.7 }), null);
  assert.equal(normalizeCoordinate({ latitude: 8.95, longitude: 181 }), null);
});

test("location freshness rejects stale and implausibly future values", () => {
  const now = Date.parse("2026-10-11T10:00:00.000Z");
  assert.equal(isLocationFresh("2026-10-11T09:59:00.000Z", now), true);
  assert.equal(isLocationFresh("2026-10-11T09:50:00.000Z", now), false);
  assert.equal(isLocationFresh("2026-10-11T10:01:00.000Z", now), false);
  assert.equal(isLocationFresh("not-a-date", now), false);
});

test("formats stale location age without rounding it into live", () => {
  const now = Date.parse("2026-10-11T10:00:00.000Z");
  assert.equal(formatLocationAge("2026-10-11T09:59:15.000Z", now), "45s ago");
  assert.equal(formatLocationAge("2026-10-11T09:30:00.000Z", now), "30m ago");
  assert.equal(formatLocationAge(undefined, now), null);
});

test("ETA is derived only from a valid start and agreed duration", () => {
  assert.equal(estimateArrival(null, 20), null);
  assert.equal(estimateArrival("not-a-date", 20), null);
  assert.equal(estimateArrival("2026-10-11T10:00:00.000Z", 20)?.toISOString(), "2026-10-11T10:20:00.000Z");
  assert.equal(estimateArrival("2026-10-11T10:00:00.000Z", 2000), null);
});
