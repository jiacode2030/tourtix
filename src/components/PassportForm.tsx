"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addStamp } from "@/app/actions";
import { btnPrimary, input } from "@/lib/ui";
import { ArtistThumb } from "./ArtistThumb";

type Suggestion = { id: string; name: string; imageUrl: string | null };

// Adds a past concert. Picking a suggestion links the stamp to the artist (for
// the photo); typing any name also works, for artists we can't find.
export function PassportForm({ error }: { error: string | null }) {
  const [name, setName] = useState("");
  const [artistId, setArtistId] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<string | undefined>(undefined);
  const latest = useRef("");

  useEffect(() => {
    // Local date, so "today" is today where the person is.
    queueMicrotask(() => setToday(new Date().toLocaleDateString("en-CA")));
  }, []);

  useEffect(() => {
    const q = name.trim();
    latest.current = q;
    if (q.length < 2 || artistId) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        const data: Suggestion[] = await res.json();
        if (latest.current === q) setSuggestions(data);
      } catch {
        // Suggestions are optional; typing the name still works.
      }
    }, 300);
    return () => clearTimeout(t);
  }, [name, artistId]);

  const visible = open && !artistId && name.trim().length >= 2 ? suggestions : [];

  return (
    <form action={addStamp} id="add" className="scroll-mt-20 space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
      <h2 className="text-xl font-bold tracking-tight">Add a concert</h2>
      {error && (
        <p role="alert" className="rounded-2xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
          {error}
        </p>
      )}
      <div className="relative space-y-1">
        <label htmlFor="artistName" className="text-sm font-medium">
          Who did you see?
        </label>
        <input
          id="artistName"
          name="artistName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setArtistId("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          required
          maxLength={100}
          autoComplete="off"
          placeholder="Start typing an artist"
          className={input}
        />
        <input type="hidden" name="artistId" value={artistId} />
        {visible.length > 0 && (
          <ul
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-line bg-bg py-1 shadow-xl"
          >
            {visible.map((s) => (
              <li key={s.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => {
                    setName(s.name);
                    setArtistId(s.id);
                    setOpen(false);
                  }}
                  className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left font-medium hover:bg-surface"
                >
                  <ArtistThumb name={s.name} imageUrl={s.imageUrl} size="h-9 w-9" />
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <input id="date" name="date" type="date" required min="1950-01-01" max={today} className={input} />
        </div>
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm font-medium">
            City <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="city" name="city" maxLength={80} autoComplete="off" className={input} />
        </div>
        <div className="space-y-1">
          <label htmlFor="venue" className="text-sm font-medium">
            Venue <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="venue" name="venue" maxLength={100} autoComplete="off" className={input} />
        </div>
      </div>
      <button type="submit" className={btnPrimary}>
        <Plus size={18} aria-hidden /> Add stamp
      </button>
    </form>
  );
}
