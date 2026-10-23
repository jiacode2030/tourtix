"use client";

import { useEffect } from "react";

// Registers the service worker on every visit so the "You're offline" page is
// ready before it's needed. Notifications use the same worker.
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not supported here (e.g. private mode): the site works without it.
    });
  }, []);
  return null;
}
