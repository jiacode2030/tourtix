import type { Metadata } from "next";
import { REASONS } from "@/lib/contact";
import { btnPrimary, input } from "@/lib/ui";
import { sendContactMessage } from "./actions";

export const metadata: Metadata = { title: "Contact" };

const field = input;

const errors: Record<string, string> = {
  short: "Please write a little more so we can help.",
  busy: "We're getting a lot of messages right now. Please try again in an hour.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; reason?: string; about?: string }>;
}) {
  const { sent, error, reason, about: aboutRaw } = await searchParams;
  // From a show's "Report a problem" link: tells us which show, so you don't have to.
  const about = aboutRaw?.replace(/\s+/g, " ").trim().slice(0, 200) || null;
  if (sent) {
    return (
      <div className="mx-auto max-w-xl space-y-3 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Thanks, message sent!</h1>
        <p className="text-muted">If you left an email address, we&apos;ll reply there.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact TourTix</h1>
        <p className="text-muted">
          Questions, feedback, privacy requests, or a request to remove content (for example, from
          an event organizer). Removal requests are handled within 24 hours.
        </p>
      </div>
      {error && errors[error] && <p className="text-red-600 dark:text-red-400">{errors[error]}</p>}
      <form action={sendContactMessage} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">What&apos;s this about?</span>
          <select name="reason" defaultValue={reason && reason in REASONS ? reason : "general"} className={field}>
            {Object.entries(REASONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Message</span>
          <textarea
            name="message"
            required
            minLength={5}
            maxLength={3000}
            rows={6}
            defaultValue={about ? `About: ${about}\n\nWhat's wrong: ` : undefined}
            className={`${field} py-3`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Your email (optional, only if you want a reply)</span>
          <input name="email" type="email" maxLength={200} className={field} />
        </label>
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" className={btnPrimary}>
          Send
        </button>
      </form>
    </div>
  );
}
