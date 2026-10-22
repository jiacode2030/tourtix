"use client";

import { HELP_EVENT, type HelpView } from "@/lib/help";

// A button that opens the Help sheet (see HelpCenter), on the tour or the menu.
export function OpenHelpButton({ view = "tour", className, children }: { view?: HelpView; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(HELP_EVENT, { detail: view }))} className={className}>
      {children}
    </button>
  );
}
