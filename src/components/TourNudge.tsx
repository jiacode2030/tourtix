"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { HELP_EVENT, TOUR_SEEN_KEY } from "@/lib/help";
import { btnPrimary } from "@/lib/ui";

// A gentle, dismissible first-visit prompt on the homepage. Never opens by itself.
export function TourNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(TOUR_SEEN_KEY) === "1";
    } catch {
      // No storage (private browsing): show it; dismissing still hides it this visit.
    }
    queueMicrotask(() => setShow(!seen));
  }, []);

  if (!show) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      // Fine: it may show again next visit.
    }
    setShow(false);
  };

  return (
    <div role="region" aria-label="New here?" className="enter mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-accent-soft p-3 pl-4 text-left text-sm">
      <Sparkles size={20} aria-hidden className="shrink-0 text-accent" />
      <span className="flex-1">
        <span className="font-semibold">New here?</span> <span className="text-muted">Take the one-minute tour.</span>
      </span>
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new CustomEvent(HELP_EVENT, { detail: "tour" }));
          dismiss();
        }}
        className={`${btnPrimary} min-h-10 px-4 text-sm`}
      >
        Start
      </button>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:text-fg">
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}
