"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = new URL(path, window.location.origin).href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User closed the share sheet.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={share} className="flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">
      {copied ? <Check size={18} aria-hidden /> : <Share2 size={18} aria-hidden />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
