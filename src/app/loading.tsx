import { Bar, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <Bar className="h-10 w-80 max-w-full" />
        <Bar className="h-4 w-96 max-w-full" />
        <Bar className="h-12 w-full max-w-xl" />
      </div>
      <div className="space-y-4">
        <Bar className="h-6 w-56" />
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}
