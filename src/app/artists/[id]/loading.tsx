import { Bar, ShowCardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading shows">
      <Bar className="h-4 w-28" />
      <div className="flex items-center gap-4">
        <Bar className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Bar className="h-8 w-56" />
          <Bar className="h-4 w-40" />
        </div>
      </div>
      <Bar className="h-9 w-36" />
      <div className="space-y-3">
        <ShowCardSkeleton />
        <ShowCardSkeleton />
        <ShowCardSkeleton />
      </div>
    </div>
  );
}
