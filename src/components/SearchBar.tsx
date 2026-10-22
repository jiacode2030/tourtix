"use client";

import Link from "next/link";
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
    <form action="/" method="get" className="relative flex w-full gap-2" onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <input
        name="q"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search an artist, e.g. Calvin Harris"
        aria-label="Search artists"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        role="combobox"
        aria-expanded={visible.length > 0}
        aria-controls="artist-suggestions"
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-violet-900"
      />
      <button type="submit" className="rounded-lg bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-700">
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
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white text-left shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {visible.map((s) => (
            <li key={s.id} role="option" aria-selected={false}>
              <Link
                href={`/artists/${s.id}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    s.name.charAt(0)
                  )}
                </span>
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
