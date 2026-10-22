"use client";

import { LocateFixed, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { saveLocation } from "@/app/actions";
import { RADIUS_OPTIONS } from "@/lib/geo";
import { btnPrimary, btnSecondary, input } from "@/lib/ui";

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
        <p className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm">
          <MapPin size={16} aria-hidden className="shrink-0 text-accent" /> <strong>{summary}</strong>
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
            className={`${input} w-36`}
          />
          <button type="submit" onClick={() => (mode.current!.value = "zip")} className={btnPrimary}>
            Save
          </button>
          <span className="self-center text-sm text-muted">or</span>
          <button type="button" onClick={useHere} className={btnSecondary}>
            <LocateFixed size={18} aria-hidden /> Use my current location
          </button>
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">&ldquo;Near me&rdquo; means within</span>
        <select
          name="radius"
          defaultValue={radiusMiles}
          onChange={() => hasLocation && submitAs("zip")}
          className={`${input} block w-auto`}
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r} miles
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {saved && !status && <span className="font-medium text-live">Saved!</span>}
        {error && errors[error] && <span className="text-red-600 dark:text-red-400">{errors[error]}</span>}
        {status && <span className="text-muted">{status}</span>}
        {hasLocation && (
          <button type="button" onClick={() => submitAs("clear")} className="text-muted underline hover:text-red-600">
            Remove my location
          </button>
        )}
      </div>
    </form>
  );
}
