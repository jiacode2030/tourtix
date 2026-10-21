// US ZIP code lookup via Zippopotam.us: free, keyless, built on open
// GeoNames data. Only the ZIP itself is sent, never anything about the user.

export type ZipPlace = { zip: string; city: string; region: string; lat: number; lng: number };

export const isZip = (s: string) => /^\d{5}$/.test(s);

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseZipResponse(zip: string, data: any): ZipPlace | null {
  const place = data?.places?.[0];
  const lat = Number(place?.latitude);
  const lng = Number(place?.longitude);
  const region = place?.["state abbreviation"];
  if (!place || !Number.isFinite(lat) || !Number.isFinite(lng) || typeof region !== "string") return null;
  return { zip, city: String(place["place name"] ?? ""), region, lat, lng };
}

export async function lookupZip(zip: string): Promise<ZipPlace | null> {
  if (!isZip(zip)) return null;
  // ZIP locations almost never change, so cache lookups for a month.
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`ZIP lookup ${res.status}`);
  return parseZipResponse(zip, await res.json());
}
