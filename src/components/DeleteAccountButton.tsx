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
      className="inline-flex min-h-11 items-center rounded-full border border-red-300 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
    >
      {pending ? "Deleting…" : "Delete my account"}
    </button>
  );
}
