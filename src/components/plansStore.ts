"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PLANS_EVENT, PLANS_KEY, parsePlans, serializePlans, type Plan } from "@/lib/plans";

// Reads and writes the visitor's plans in their own browser. Every component
// on the page stays in step through the browser's storage events plus our own.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PLANS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PLANS_EVENT, callback);
  };
}

function readRaw(): string {
  try {
    return localStorage.getItem(PLANS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function usePlans(): Plan[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  return useMemo(() => parsePlans(raw), [raw]);
}

export function savePlans(plans: Plan[]) {
  try {
    if (plans.length) localStorage.setItem(PLANS_KEY, serializePlans(plans));
    else localStorage.removeItem(PLANS_KEY);
  } catch {
    // Private browsing or storage full: the plan just won't be remembered.
  }
  window.dispatchEvent(new Event(PLANS_EVENT));
}
