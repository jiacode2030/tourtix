"use client";

import { useTransition } from "react";
import { deleteMyAccount } from "@/app/actions";

export function DeleteAccountButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete your account and all your data? This can't be undone.")) {
          startTransition(() => deleteMyAccount());
        }
      }}
      className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
    >
      {pending ? "Deleting…" : "Delete my account"}
    </button>
  );
}
