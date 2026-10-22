"use client";

import { useRef, useState } from "react";
import { saveLocation } from "@/app/actions";
import { RADIUS_OPTIONS } from "@/lib/geo";

const field =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
const primary =
  "rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60";
const secondary =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

const errors: Record<string, string> = {
  zip: "We couldn't find that ZIP code. Check it and try again.",
  zipservice: "The ZIP lookup service isn't responding. Try again in a minute, or use your current location.",
  here: "Couldn't read your location. Try again or enter a ZIP code.",
};

export function LocationForm({
  summary,
  zip,
  radiusMiles,
  hasLocation,
  saved,
  error,
}: {
  summary: string | null;
  zip: string | null;
  radiusMiles: number;
  hasLocation: boolean;
  saved: boolean;
  error: string | null;
}) {
  const form = useRef<HTMLFormElement>(null);
  const mode = useRef<HTMLInputElement>(null);
  const lat = useRef<HTMLInputElement>(null);
  const lng = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const submitAs = (value: string) => {
    mode.current!.value = value;
    form.current!.requestSubmit();
  };

  const useHere = () => {
    if (!navigator.geolocation) {
      setStatus("Your browser can't share location. Enter a ZIP code instead.");
      return;
    }
    setStatus("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat.current!.value = String(pos.coords.latitude);
        lng.current!.value = String(pos.coords.longitude);
        setStatus("Saving…");
        submitAs("here");
      },
      () => setStatus("Couldn't get your location. Check your browser's location permission, or enter a ZIP code."),
      { timeout: 10000 },
    );
  };

  return (
    <form ref={form} action={saveLocation} className="space-y-4">
      <input ref={mode} type="hidden" name="mode" defaultValue="zip" />
      <input ref={lat} type="hidden" name="lat" />
      <input ref={lng} type="hidden" name="lng" />

      {summary && (
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50">
          📍 <strong>{summary}</strong>
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="zip" className="text-sm font-medium">
          ZIP code
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="zip"
            name="zip"
            defaultValue={zip ?? ""}
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="\d{5}"
            maxLength={5}
            placeholder="e.g. 90012"
            title="5-digit US ZIP code"
            className={`${field} w-36`}
          />
          <button type="submit" onClick={() => (mode.current!.value = "zip")} className={primary}>
            Save
          </button>
          <span className="self-center text-sm text-zinc-600 dark:text-zinc-400">or</span>
          <button type="button" onClick={useHere} className={secondary}>
            📍 Use my current location
          </button>
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">&ldquo;Near me&rdquo; means within</span>
        <select
          name="radius"
          defaultValue={radiusMiles}
          onChange={() => hasLocation && submitAs("zip")}
          className={`${field} block`}
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r} miles
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {saved && !status && <span className="text-emerald-600">Saved!</span>}
        {error && errors[error] && <span className="text-rose-600">{errors[error]}</span>}
        {status && <span className="text-zinc-600 dark:text-zinc-400">{status}</span>}
        {hasLocation && (
          <button type="button" onClick={() => submitAs("clear")} className="text-zinc-600 dark:text-zinc-400 underline hover:text-rose-600">
            Remove my location
          </button>
        )}
      </div>
    </form>
  );
}
