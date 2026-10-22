"use client";

import { btnPrimary } from "@/lib/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mx-auto max-w-md text-muted">
        We couldn&apos;t load this page. Ticket data providers may be busy. Please try again in a
        minute.
      </p>
      <button
        type="button"
        onClick={reset}
        className={btnPrimary}
      >
        Try again
      </button>
    </div>
  );
}
