import type { Show } from "./types";

export type UserLocation = {
  region: string | null;
  lat: number | null;
  lng: number | null;
  radiusMiles: number;
};

export const RADIUS_OPTIONS = [25, 50, 100, 200, 500];
export const DEFAULT_RADIUS = 100;

export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(a));
}

// Near = within the user's radius when both locations are known, otherwise
// in the same US state. Null location means nothing counts as near.
export function isNear(show: Show, loc: UserLocation | null): boolean {
  if (!loc) return false;
  if (loc.lat != null && loc.lng != null && show.lat != null && show.lng != null) {
    return milesBetween(loc.lat, loc.lng, show.lat, show.lng) <= loc.radiusMiles;
  }
  return loc.region != null && show.country === "US" && show.region === loc.region;
}

export function hasLocation(loc: UserLocation | null) {
  return !!loc && (loc.region != null || (loc.lat != null && loc.lng != null));
}

// Geohash encoding, used for Ticketmaster's geoPoint search parameter.
export function geohash(lat: number, lng: number, precision = 7) {
  const base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let [latMin, latMax, lngMin, lngMax] = [-90, 90, -180, 180];
  let hash = "";
  let bit = 0;
  let ch = 0;
  let evenBit = true;
  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        ch = (ch << 1) | 1;
        lngMin = mid;
      } else {
        ch <<= 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        ch = (ch << 1) | 1;
        latMin = mid;
      } else {
        ch <<= 1;
        latMax = mid;
      }
    }
    evenBit = !evenBit;
    if (++bit === 5) {
      hash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}
