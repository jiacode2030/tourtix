"use client";

import { Share, SquarePlus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { INSTALL_TIP_KEY, isIos, showInstallTip } from "@/lib/install-tip";
import { linkAccent } from "@/lib/ui";

// iPhone only: explains Add to Home Screen, which iPhone requires for alerts.
// Hidden once installed, and for 30 days after it's dismissed (kept only in
// this browser).
export function InstallTipCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissedAt: string | null = null;
    try {
      dismissedAt = localStorage.getItem(INSTALL_TIP_KEY);
    } catch {
      // Storage blocked: just show the card.
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ok = showInstallTip({ ios: isIos(navigator.userAgent, navigator.maxTouchPoints), standalone, dismissedAt });
    queueMicrotask(() => setShow(ok));
  }, []);

  if (!show) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(INSTALL_TIP_KEY, String(Date.now()));
    } catch {
      // Not saved; it will show again next visit.
    }
    setShow(false);
  };

  return (
    <section className="pop relative space-y-3 rounded-3xl bg-surface p-5 text-sm" aria-label="Get alerts on iPhone">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
      >
        <X size={18} aria-hidden />
      </button>
      <p className="pr-10 text-base font-semibold">Get alerts on your iPhone</p>
      <p className="text-muted">
        iPhone only sends website alerts to apps on your Home Screen. It takes 10 seconds and is free.
      </p>
      <ol className="space-y-2">
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Share size={18} aria-hidden />
          </span>
          <span>
            <span className="font-medium">1.</span> Tap the Share button in Safari.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <SquarePlus size={18} aria-hidden />
          </span>
          <span>
            <span className="font-medium">2.</span> Choose &ldquo;Add to Home Screen&rdquo;.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            3
          </span>
          <span>Open TourTix from your Home Screen, then turn on notifications in Settings.</span>
        </li>
      </ol>
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/settings#notifications" className={linkAccent}>
          Notification settings
        </Link>
        <Link href="/help/notifications#iphone" className={linkAccent}>
          Help
        </Link>
      </p>
    </section>
  );
}
