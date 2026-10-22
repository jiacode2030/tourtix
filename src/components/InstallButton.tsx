"use client";

import { Smartphone } from "lucide-react";
import Link from "next/link";
import { btnSecondary, linkAccent } from "@/lib/ui";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Offers "Install TourTix" where the browser supports it (Chrome, Edge,
// Android), and Add to Home Screen steps on iPhone.
export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Read once on mount; these don't change while the page is open.
    queueMicrotask(() => {
      setInstalled(standalone);
      setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !standalone);
    });
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (prompt) {
    return (
      <button
        type="button"
        onClick={async () => {
          await prompt.prompt();
          await prompt.userChoice;
          setPrompt(null);
        }}
        className={btnSecondary}
      >
        <Smartphone size={18} aria-hidden /> Install TourTix as an app
      </button>
    );
  }
  if (ios) {
    return (
      <p className="flex gap-2 text-sm text-muted">
        <Smartphone size={18} aria-hidden className="mt-0.5 shrink-0" />
        <span>
        Add TourTix to your Home Screen: tap Share, then &ldquo;Add to Home Screen&rdquo;.{" "}
        <Link href="/help/notifications#iphone" className={linkAccent}>
          Help
        </Link>
        </span>
      </p>
    );
  }
  return null;
}
