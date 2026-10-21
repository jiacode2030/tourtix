import Link from "next/link";
import { notFound } from "next/navigation";
import { ShowRow } from "@/components/ShowRow";
import { getArtist, getShows } from "@/lib/data";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();
  const shows = await getShows(id);

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-block text-sm text-zinc-500 hover:text-violet-600">
        ← Back to search
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-bold text-white">
          {artist.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            artist.name.charAt(0)
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-zinc-500">{artist.genre ?? "Music"}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Upcoming shows <span className="text-zinc-400">({shows.length})</span>
        </h2>
        {shows.length ? (
          <ul className="space-y-3">
            {shows.map((s) => (
              <ShowRow key={s.id} show={s} />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
            No upcoming shows right now.
          </p>
        )}
      </section>
    </div>
  );
}
