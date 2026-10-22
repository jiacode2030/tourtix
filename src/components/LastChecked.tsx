"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// "Page updated 2:05 PM" in the viewer's own time zone. The server passes the
// time it built the page; rendering waits for the browser to avoid a mismatch.
export function LastChecked({ at }: { at: string }) {
  const label = useSyncExternalStore(
    noop,
    () => new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    () => null,
  );
  if (!label) return null;
  return <>Page updated {label}.</>;
}
