import { Bar, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading concerts">
      <div className="space-y-2">
        <Bar className="h-9 w-56" />
        <Bar className="h-4 w-72" />
      </div>
      <Bar className="h-11 w-full" />
      <ListSkeleton rows={6} />
    </div>
  );
}
