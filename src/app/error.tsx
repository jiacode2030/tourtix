"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t load this page. Ticket data providers may be busy. Please try again in a
        minute.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
      >
        Try again
      </button>
    </div>
  );
}
