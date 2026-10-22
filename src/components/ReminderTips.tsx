import { CalendarPlus, Smartphone } from "lucide-react";
import Link from "next/link";

// Plain-language ways to get dependable reminders, shown near notification settings.
export function ReminderTips() {
  return (
    <div className="space-y-3 rounded-3xl bg-surface p-5 text-sm">
      <p className="font-semibold">For the most reliable reminders</p>
      <p className="flex gap-3">
        <Smartphone size={18} aria-hidden className="mt-0.5 shrink-0 text-accent" />
        <span className="text-muted">
          <span className="font-medium text-fg">Add TourTix to your phone&apos;s Home Screen.</span> On
          iPhone, alerts only work this way: tap Share, then &ldquo;Add to Home Screen&rdquo;, and open
          it from there.
        </span>
      </p>
      <p className="flex gap-3">
        <CalendarPlus size={18} aria-hidden className="mt-0.5 shrink-0 text-accent" />
        <span className="text-muted">
          <span className="font-medium text-fg">Tap &ldquo;Remind me&rdquo; on any sale</span> to put it
          on your calendar. Your calendar app will alert you even if phone notifications are off.
        </span>
      </p>
      <p className="text-muted">
        More answers:{" "}
        <Link href="/faq" className="font-medium text-accent hover:underline">
          FAQ
        </Link>{" "}
        ·{" "}
        <Link href="/help/notifications" className="font-medium text-accent hover:underline">
          Notification help
        </Link>
      </p>
    </div>
  );
}
