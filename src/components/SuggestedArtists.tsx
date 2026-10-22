import Link from "next/link";
import { popularArtists } from "@/lib/data";
import { GENRES, isGenre } from "@/lib/genres";
import { chip, chipOn } from "@/lib/ui";
import { ArtistCard } from "./ArtistCard";
import { SearchBar } from "./SearchBar";

// The first thing a new sign-in sees on My Artists: popular touring artists to
// follow with one tap, narrowed by genre. Uses only public data, nothing about the person.
export async function SuggestedArtists({ genreParam, followedIds = [] }: { genreParam?: string; followedIds?: string[] }) {
  const genre = isGenre(genreParam) ? genreParam : undefined;
  const artists = await popularArtists(8, genre);
  const followed = new Set(followedIds);
  const more = followed.size > 0;
  const href = (g?: string) => (g ? `/my-artists?genre=${encodeURIComponent(g)}` : "/my-artists");

  return (
    <section className="space-y-5 rounded-3xl bg-surface p-5 sm:p-6" aria-label="Artists to follow">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">{more ? "Follow a few more" : "Pick a few artists to follow"}</h2>
        <p className="text-sm text-muted">
          Tap the <span className="font-semibold text-fg">+</span> on an artist. Their shows and presales will show up here, and
          you can turn on alerts next.
        </p>
      </div>

      <nav className="stagger -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="Filter by genre">
        {[undefined, ...GENRES].map((g) => (
          <Link key={g ?? "all"} href={href(g)} scroll={false} className={`${chip} ${g === genre ? chipOn : "bg-bg text-fg hover:bg-surface-2"}`}>
            {g ?? "All music"}
          </Link>
        ))}
      </nav>

      {artists.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-4">
          {artists.map((a) => (
            <ArtistCard key={a.id} artist={a} nextSale={a.nextSale} following={followed.has(a.id)} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No artists to suggest right now. Try searching below.</p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Or search for anyone</p>
        <SearchBar />
      </div>
    </section>
  );
}
