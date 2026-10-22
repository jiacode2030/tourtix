"use client";

import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { btnPrimary, btnSecondary } from "@/lib/ui";

// Makes a picture of the passport to share. Dates are on by default; cities and
// a first name are off until ticked, so nothing personal is included by accident.
export function ShareCard() {
  const [dates, setDates] = useState(true);
  const [cities, setCities] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  // Refresh the preview after typing stops, not on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setPreviewName(name), 600);
    return () => clearTimeout(t);
  }, [name]);

  const url = `/passport/card?dates=${dates ? 1 : 0}&cities=${cities ? 1 : 0}&name=${encodeURIComponent(previewName.trim())}`;

  async function share() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/passport/card?dates=${dates ? 1 : 0}&cities=${cities ? 1 : 0}&name=${encodeURIComponent(name.trim())}`);
      if (!res.ok) throw new Error(String(res.status));
      const file = new File([await res.blob()], "my-concert-passport.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My concert passport" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
        setMessage("Saved to your downloads.");
      }
    } catch (err) {
      // Closing the share sheet isn't an error.
      if (!(err instanceof DOMException && err.name === "AbortError")) setMessage("Couldn't make the picture. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Share your passport</h2>
        <p className="text-sm text-muted">
          Makes a picture you can post or send. It only shows what you tick below, and it isn&apos;t saved or linked
          anywhere.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-[1fr_220px]">
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={dates} onChange={(e) => setDates(e.target.checked)} className="h-5 w-5 accent-accent" />
            Show dates
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={cities} onChange={(e) => setCities(e.target.checked)} className="h-5 w-5 accent-accent" />
            Show cities
          </label>
          <div className="space-y-1">
            <label htmlFor="share-name" className="font-medium">
              First name <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="share-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoComplete="off"
              placeholder="Shows as “Alex's passport”"
              className="min-h-11 w-full rounded-xl border border-line bg-bg px-4 text-[15px] placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={share} disabled={busy} className={btnPrimary}>
              <Share2 size={18} aria-hidden /> {busy ? "Making…" : "Share picture"}
            </button>
            <a href={url} download="my-concert-passport.png" className={btnSecondary}>
              <Download size={18} aria-hidden /> Save
            </a>
          </div>
          {message && <p className="text-muted">{message}</p>}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Preview of your concert passport picture" loading="lazy" className="w-full max-w-[220px] rounded-2xl border border-line" />
      </div>
    </section>
  );
}
