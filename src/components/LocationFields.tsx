"use client";

import { useState } from "react";

// Hidden lat/lng inputs for the location form, filled from the browser's
// location (rounded to ~1 km) when the user asks.
export function LocationFields({ lat, lng }: { lat: number | null; lng: number | null }) {
  const [coords, setCoords] = useState(lat != null && lng != null ? { lat, lng } : null);
  const [status, setStatus] = useState<string | null>(null);

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("Your browser can't share location. Pick your state instead.");
      return;
    }
    setStatus("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const round = (n: number) => Math.round(n * 100) / 100;
        setCoords({ lat: round(pos.coords.latitude), lng: round(pos.coords.longitude) });
        setStatus("Got it. Click Save to keep it.");
      },
      () => setStatus("Couldn't get your location. Check your browser's location permission."),
      { timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name="lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="lng" value={coords?.lng ?? ""} />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {coords ? (
          <>
            <span>📍 Using your precise location for distances.</span>
            <button
              type="button"
              onClick={() => {
                setCoords(null);
                setStatus("Removed. Click Save to confirm.");
              }}
              className="font-medium text-violet-600 hover:underline"
            >
              Remove
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={locate}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            📍 Use my current location
          </button>
        )}
      </div>
      {status && <p className="text-sm text-zinc-500">{status}</p>}
    </div>
  );
}
