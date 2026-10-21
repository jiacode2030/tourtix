// Gray placeholder blocks shown while a page waits for ticket data.
export function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

export function ShowCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-4">
        <Bar className="h-4 w-28" />
        <div className="flex-1 space-y-2">
          <Bar className="h-4 w-48" />
          <Bar className="h-3 w-32" />
        </div>
        <Bar className="h-5 w-16 rounded-full" />
      </div>
      <Bar className="h-8 w-56" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Bar className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Bar className="h-4 w-40" />
            <Bar className="h-3 w-56" />
          </div>
          <Bar className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
