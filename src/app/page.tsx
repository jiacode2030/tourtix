import { ArtistCard } from "@/components/ArtistCard";
import { SearchBar } from "@/components/SearchBar";
import { featuredArtists, searchArtists } from "@/lib/data";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim() ?? "";
  const results = q ? await searchArtists(q) : featuredArtists();

  return (
    <div className="space-y-8">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Never miss a ticket drop
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Follow artists, track their tours, and find the cheapest tickets when they go on sale.
        </p>
        <div className="mx-auto max-w-xl">
          <SearchBar defaultValue={q} />
        </div>
      </section>

      <section className="space-y-4">
        {q && (
          <h2 className="text-lg font-semibold">
            {results.length ? `Results for “${q}”` : `No artists found for “${q}”`}
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
