import { usingSampleData } from "@/lib/data";

export function SampleBanner() {
  if (!usingSampleData) return null;
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Showing <strong>sample data</strong>. Add a Ticketmaster API key to see real tours.
    </div>
  );
}
