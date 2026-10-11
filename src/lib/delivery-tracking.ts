export type CoordinateInput = {
  latitude?: string | number | null;
  longitude?: string | number | null;
};

export type Coordinate = { latitude: number; longitude: number };

export function normalizeCoordinate(value: CoordinateInput | null | undefined): Coordinate | null {
  if (
    !value ||
    value.latitude === null ||
    value.latitude === undefined ||
    value.latitude === "" ||
    value.longitude === null ||
    value.longitude === undefined ||
    value.longitude === ""
  ) return null;

  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) return null;

  return { latitude, longitude };
}

export function isLocationFresh(
  updatedAt?: string | null,
  now = Date.now(),
  maximumAgeMs = 3 * 60 * 1000,
): boolean {
  if (!updatedAt) return false;
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return false;
  const age = now - timestamp;
  return age >= -30_000 && age <= maximumAgeMs;
}

export function formatLocationAge(updatedAt?: string | null, now = Date.now()): string | null {
  if (!updatedAt) return null;
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return null;
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return seconds + "s ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

/** Estimate a display time from the accepted duration; this is not traffic-aware routing. */
export function estimateArrival(
  startedAt?: string | null,
  agreedEtaMinutes?: number | string | null,
): Date | null {
  if (!startedAt || agreedEtaMinutes === null || agreedEtaMinutes === undefined || agreedEtaMinutes === "") {
    return null;
  }
  const start = Date.parse(startedAt);
  const etaMinutes = Number(agreedEtaMinutes);
  if (!Number.isFinite(start) || !Number.isFinite(etaMinutes) || etaMinutes <= 0 || etaMinutes > 24 * 60) {
    return null;
  }
  return new Date(start + etaMinutes * 60_000);
}
