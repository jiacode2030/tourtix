"use client";

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
      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-md transition ${
        following ? "bg-violet-600 text-white" : "bg-white/90 text-violet-700 hover:bg-white dark:bg-zinc-900/90 dark:text-violet-300"
      }`}
    >
      {following ? "★" : "☆"}
    </button>
  );
}
