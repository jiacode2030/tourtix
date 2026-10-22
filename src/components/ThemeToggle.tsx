"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Reads the theme from the <html> class set by the inline theme script.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => null,
  );
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private browsing: the choice just won't be remembered.
    }
  };
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex min-h-11 items-center gap-3 rounded-full px-2 text-fg hover:bg-surface"
    >
      {dark ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
      {withLabel && <span className="text-sm font-medium">{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
