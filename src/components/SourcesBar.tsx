import { activeSources } from "@/lib/sources";

function joinNames(names: string[]) {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

export function SourcesBar() {
  const sources = activeSources();
  if (!sources.length) return null;
  return (
    <div className="bg-violet-50 px-4 py-2 text-center text-sm text-violet-900 dark:bg-violet-950 dark:text-violet-200">
      Show info comes from <strong>{joinNames(sources)}</strong>, plus links to search other ticket
      sites. TourTix doesn&apos;t sell tickets.
    </div>
  );
}
