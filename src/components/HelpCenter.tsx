"use client";

import { BadgeCheck, Bell, ChevronLeft, ChevronRight, CircleHelp, LifeBuoy, Search, Sparkles, Stamp, Ticket, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HELP_EVENT, TOUR_SEEN_KEY, TOUR_STEPS, tipsFor, type HelpView, type TourIcon } from "@/lib/help";
import { btnPrimary, btnSecondary } from "@/lib/ui";

const ICONS: Record<TourIcon, typeof Search> = {
  search: Search,
  follow: UserPlus,
  alerts: Bell,
  shows: Ticket,
  presales: BadgeCheck,
  passport: Stamp,
  help: LifeBuoy,
};

const markTourSeen = () => {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // Private browsing: the first-visit nudge may show again. Harmless.
  }
};

// The "?" button on every page. Opens a sheet with the quick tour, tips for the
// page you're on, and links to more help. Other buttons open it by firing HELP_EVENT.
export function HelpCenter() {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [view, setView] = useState<HelpView>("menu");
  const [step, setStep] = useState(0);
  // The ? button slides away while you scroll down (it would cover content) and
  // comes back as soon as you scroll up, stop, or reach the top.
  const [tucked, setTucked] = useState(false);

  const open = useCallback((v: HelpView) => {
    setView(v);
    setStep(0);
    if (v === "tour") markTourSeen();
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  const close = () => dialog.current?.close();

  useEffect(() => {
    const onHelp = (e: Event) => open((e as CustomEvent<HelpView>).detail === "tour" ? "tour" : "menu");
    window.addEventListener(HELP_EVENT, onHelp);
    return () => window.removeEventListener(HELP_EVENT, onHelp);
  }, [open]);

  useEffect(() => {
    let last = window.scrollY;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      if (y < 120 || delta < -6) setTucked(false);
      else if (delta > 8) setTucked(true);
      clearTimeout(timer);
      timer = setTimeout(() => setTucked(false), 900); // back once scrolling stops
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  // Moving to another page (for example from a tour link) closes the sheet.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const tips = tipsFor(pathname);
  const last = TOUR_STEPS.length - 1;
  const s = TOUR_STEPS[step];
  const Icon = ICONS[s.icon];

  return (
    <>
      <button
        type="button"
        onClick={() => open("menu")}
        onFocus={() => setTucked(false)}
        aria-label="Help"
        title="Help"
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-cta text-on-cta shadow-lg transition-all duration-200 hover:opacity-90 active:scale-95 print:hidden ${tucked ? "pointer-events-none translate-y-20 opacity-0" : ""}`}
      >
        <CircleHelp size={24} aria-hidden />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="help-title"
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto max-h-[88vh] w-[min(34rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl bg-bg p-0 text-fg shadow-2xl backdrop:bg-black/55"
      >
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="help-title" className="text-xl font-bold tracking-tight">
              {view === "tour" ? "Quick tour" : "How can we help?"}
            </h2>
            <button type="button" onClick={close} aria-label="Close help" className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-fg">
              <X size={20} aria-hidden />
            </button>
          </div>

          {view === "menu" ? (
            <>
              <button
                type="button"
                onClick={() => open("tour")}
                className="flex w-full items-center gap-4 rounded-2xl bg-accent-soft p-4 text-left transition hover:opacity-90 active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cta text-on-cta">
                  <Sparkles size={20} aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">Take the quick tour</span>
                  <span className="block text-sm text-muted">Seven short steps, about a minute.</span>
                </span>
              </button>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{tips.heading}</h3>
                <ul className="space-y-3">
                  {tips.tips.map((t) => (
                    <li key={t.title} className="text-sm">
                      <span className="font-semibold">{t.title}.</span> <span className="text-muted">{t.text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <nav aria-label="More help" className="grid gap-2 sm:grid-cols-2">
                <Link href="/faq" className={btnSecondary}>
                  Read the FAQ
                </Link>
                <Link href="/help/notifications" className={btnSecondary}>
                  Notification help
                </Link>
                <Link href="/tips" className={btnSecondary}>
                  Ticket buying tips
                </Link>
                <Link href="/contact" className={btnSecondary}>
                  Contact us
                </Link>
              </nav>
            </>
          ) : (
            <div
              className="space-y-5"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setStep((n) => Math.min(last, n + 1));
                if (e.key === "ArrowLeft") setStep((n) => Math.max(0, n - 1));
              }}
            >
              <div key={s.id} className="enter space-y-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon size={28} aria-hidden />
                </span>
                <p className="text-sm font-medium text-muted">
                  Step {step + 1} of {TOUR_STEPS.length}
                </p>
                <h3 className="text-2xl font-bold tracking-tight">{s.title}</h3>
                <p className="leading-relaxed text-muted">{s.text}</p>
                {s.action && (
                  <Link href={s.action.href} className="inline-block font-semibold text-accent hover:underline">
                    {s.action.label} →
                  </Link>
                )}
              </div>

              <div className="flex justify-center gap-2" role="tablist" aria-label="Tour steps">
                {TOUR_STEPS.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={i === step}
                    aria-label={`Step ${i + 1}: ${t.title}`}
                    onClick={() => setStep(i)}
                    className={`h-2.5 rounded-full transition-all ${i === step ? "w-7 bg-accent" : "w-2.5 bg-line hover:bg-muted"}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className={btnSecondary}>
                    <ChevronLeft size={18} aria-hidden /> Back
                  </button>
                ) : (
                  <button type="button" onClick={() => open("menu")} className="min-h-11 px-2 text-sm font-medium text-muted hover:text-fg">
                    Skip tour
                  </button>
                )}
                {step < last ? (
                  <button type="button" onClick={() => setStep(step + 1)} className={btnPrimary}>
                    Next <ChevronRight size={18} aria-hidden />
                  </button>
                ) : (
                  <button type="button" onClick={close} className={btnPrimary}>
                    Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
