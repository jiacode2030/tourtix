import { Trash2 } from "lucide-react";
import { deleteStamp } from "@/app/actions";
import { stampDate, type Stamp } from "@/lib/passport";
import { STAGE_LIGHTS } from "@/lib/ui";

// One stamp: the artist, the night, and an "ink stamp" with the date. Each
// card sits at a slightly different angle, like real stamps in a passport.
export function StampCard({ stamp }: { stamp: Stamp }) {
  const tilt = ((stamp.id * 7) % 5) - 2; // -2..2 degrees, steady for a given stamp
  const place = [stamp.venue, stamp.city].filter(Boolean).join(" · ");
  return (
    <li className="group/stamp relative">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-4 transition duration-200 motion-safe:hover:!rotate-0 motion-safe:hover:-translate-y-1"
        style={{ transform: `rotate(${tilt * 0.7}deg)` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-lg font-bold text-white"
            style={stamp.imageUrl ? undefined : { background: STAGE_LIGHTS }}
          >
            {stamp.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stamp.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              stamp.artistName.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate font-semibold">{stamp.artistName}</p>
            <p className="text-sm text-muted">{stampDate(stamp.eventDate)}</p>
            {place && <p className="truncate pr-20 text-xs text-muted">{place}</p>}
          </div>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1 right-3 -rotate-12 rounded-lg border-2 border-accent px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-accent opacity-60"
        >
          {stampDate(stamp.eventDate, "stamp")}
        </span>
      </div>
      <form action={deleteStamp} className="absolute right-2 top-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover/stamp:opacity-100 sm:focus-within:opacity-100">
        <input type="hidden" name="id" value={stamp.id} />
        <button
          type="submit"
          aria-label={`Remove ${stamp.artistName} stamp`}
          title="Remove stamp"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bg/80 text-muted backdrop-blur transition hover:text-fg"
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </form>
    </li>
  );
}
