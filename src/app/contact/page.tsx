import type { Metadata } from "next";
import { REASONS } from "@/lib/contact";
import { sendContactMessage } from "./actions";

export const metadata: Metadata = { title: "Contact" };

const field =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

const errors: Record<string, string> = {
  short: "Please write a little more so we can help.",
  busy: "We're getting a lot of messages right now. Please try again in an hour.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; reason?: string }>;
}) {
  const { sent, error, reason } = await searchParams;
  if (sent) {
    return (
      <div className="mx-auto max-w-xl space-y-3 py-12 text-center">
        <h1 className="text-2xl font-bold">Thanks, message sent!</h1>
        <p className="text-zinc-500">If you left an email address, we&apos;ll reply there.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Contact TourTix</h1>
        <p className="text-zinc-500">
          Questions, feedback, privacy requests, or a request to remove content (for example, from
          an event organizer). Removal requests are handled within 24 hours.
        </p>
      </div>
      {error && errors[error] && <p className="text-rose-600">{errors[error]}</p>}
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
          <textarea name="message" required minLength={5} maxLength={3000} rows={6} className={field} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Your email (optional, only if you want a reply)</span>
          <input name="email" type="email" maxLength={200} className={field} />
        </label>
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" className="rounded-lg bg-violet-600 px-5 py-2 font-medium text-white hover:bg-violet-700">
          Send
        </button>
      </form>
    </div>
  );
}
