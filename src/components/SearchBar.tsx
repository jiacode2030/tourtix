"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { btnPrimary } from "@/lib/ui";
import { ArtistThumb } from "./ArtistThumb";
import { useEffect, useRef, useState } from "react";

type Suggestion = { id: string; name: string; imageUrl: string | null };

const DEBOUNCE_MS = 350;

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const latest = useRef("");

  useEffect(() => {
    const q = query.trim();
    latest.current = q;
    if (q.length < 2) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        const data: Suggestion[] = await res.json();
        if (latest.current === q) setSuggestions(data);
      } catch {
        // Suggestions are optional; the normal search still works.
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const visible = open && query.trim().length >= 2 ? suggestions : [];

  return (
    <form action="/" method="get" className="relative flex w-full items-center gap-2" onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <Search size={20} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        name="q"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search any artist"
        aria-label="Search artists"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        role="combobox"
        aria-expanded={visible.length > 0}
        aria-controls="artist-suggestions"
        className="min-h-13 min-w-0 flex-1 rounded-full border border-line bg-surface py-3 pl-12 pr-4 text-base text-fg outline-none placeholder:text-muted focus:border-accent focus:bg-bg"
      />
      <button type="submit" className={`${btnPrimary} min-h-13`}>
        Search
      </button>
      {visible.length > 0 && (
        <ul
          id="artist-suggestions"
          role="listbox"
          // Keep focus in the input while tapping, so the list doesn't close
          // before the tap registers (an issue on iPhone Safari).
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={() => setOpen(true)}
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-bg py-1 text-left shadow-xl"
        >
          {visible.map((s) => (
            <li key={s.id} role="option" aria-selected={false}>
              <Link
                href={`/artists/${s.id}`}
                className="flex min-h-12 items-center gap-3 px-4 py-2 font-medium hover:bg-surface"
              >
                <ArtistThumb name={s.name} imageUrl={s.imageUrl} size="h-9 w-9" />
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
