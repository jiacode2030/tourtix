import { Bar, ShowCardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading your artists">
      <div className="space-y-2">
        <Bar className="h-9 w-48" />
        <Bar className="h-4 w-32" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3">
          <Bar className="h-6 w-40" />
          <ShowCardSkeleton />
          <ShowCardSkeleton />
        </div>
      ))}
    </div>
  );
}
