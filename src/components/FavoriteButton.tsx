"use client";

import { Check, Plus } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/app/actions";
import { btnPrimary, btnSecondary } from "@/lib/ui";

export function FavoriteButton({ artistId, isFavorite }: { artistId: string; isFavorite: boolean }) {
  const [pending, startTransition] = useTransition();
  const [following, setFollowing] = useOptimistic(isFavorite);
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={following}
      onClick={() =>
        startTransition(async () => {
          setFollowing(!following);
          await toggleFavorite(artistId, following);
        })
      }
      className={following ? btnSecondary : btnPrimary}
    >
      {following ? <Check size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
