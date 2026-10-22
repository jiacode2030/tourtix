// Gray placeholder blocks shown while a page waits for ticket data.
export function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-2 ${className}`} />;
}

export function ShowCardSkeleton() {
  return (
    <div className="space-y-3 border-b border-line py-4">
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
    <div className="divide-y divide-line border-y border-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Bar className="h-12 w-12 rounded-xl" />
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
