"use client";

import { Check, Plus } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/app/actions";

// Small follow toggle that sits on top of an artist card.
export function FollowStar({ artistId, artistName, isFavorite }: { artistId: string; artistName: string; isFavorite: boolean }) {
  const [pending, startTransition] = useTransition();
  const [following, setFollowing] = useOptimistic(isFavorite);
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${artistName}` : `Follow ${artistName}`}
      title={following ? "Following. Tap to unfollow" : "Follow"}
      onClick={() =>
        startTransition(async () => {
          setFollowing(!following);
          await toggleFavorite(artistId, following);
        })
      }
      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur transition ${
        following ? "bg-cta text-on-cta" : "bg-bg/85 text-fg hover:bg-bg"
      }`}
    >
      {following ? <Check size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
    </button>
  );
}
