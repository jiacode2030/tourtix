"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Ticket data is cached for 5 minutes on the server, so re-fetch on the same
// rhythm while the page is open, and right away when the person returns to
// a tab that has gone stale.
const INTERVAL_MS = 5 * 60 * 1000;

export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      last = Date.now();
      router.refresh();
    };
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - last >= INTERVAL_MS) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);
  return null;
}
