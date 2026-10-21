"use client";

import { useTransition } from "react";
import { toggleFavorite } from "@/app/actions";

export function FavoriteButton({
  artistId,
  isFavorite,
}: {
  artistId: string;
  isFavorite: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleFavorite(artistId, isFavorite))}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
        isFavorite
          ? "border border-violet-600 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {isFavorite ? "★ Following" : "☆ Follow artist"}
    </button>
  );
}
