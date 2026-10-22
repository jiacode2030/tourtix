"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

function format(ms: number) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

// One shared one-second clock for every countdown on the page.
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// Live countdown to an ISO time. Renders nothing on the server so the
// server and browser clocks can't disagree.
export function Countdown({
  to,
  label,
  bare = false,
}: {
  to: string;
  label: string;
  // Just the time left ("18h 42m 9s"), for big headline countdowns.
  bare?: boolean;
}) {
  const current = useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
  const router = useRouter();
  const live = current != null && current >= new Date(to).getTime();
  // When a sale starts, reload the page data so the status label and the
  // next countdown (e.g. presale -> general sale) update without a manual refresh.
  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => router.refresh(), 3000);
    return () => clearTimeout(t);
  }, [live, router]);

  if (current == null) return null;
  const left = new Date(to).getTime() - current;
  if (bare) {
    return left <= 0 ? <span className="text-emerald-600">Live now</span> : <span className="tabular-nums">{format(left)}</span>;
  }
  if (left <= 0) return <span className="font-medium text-emerald-600">{label} is live now</span>;
  return (
    <span className="font-medium text-amber-700 dark:text-amber-400">
      {label} in <span className="tabular-nums">{format(left)}</span>
    </span>
  );
}
