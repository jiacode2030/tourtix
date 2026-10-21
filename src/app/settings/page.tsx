import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { saveLocation } from "@/app/actions";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { SignInPrompt } from "@/components/SignInPrompt";
import { usStates } from "@/lib/regions";
import { getProfile } from "@/lib/user-data";

export const metadata: Metadata = { title: "Settings · TourTix" };

const field =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <SignInPrompt label="Sign in" />
      </div>
    );
  }
  const saved = (await searchParams).saved === "1";
  const profile = await getProfile(userId);

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Your location</h2>
          <p className="text-sm text-zinc-500">
            Used to highlight shows near you. We only store the city and state you enter here.
          </p>
        </div>
        <form action={saveLocation} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">City</span>
            <input name="city" defaultValue={profile?.city ?? ""} placeholder="e.g. Los Angeles" className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">State</span>
            <select name="region" defaultValue={profile?.region ?? ""} className={field}>
              <option value="">Choose a state</option>
              {usStates.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Save
            </button>
            {saved && <span className="text-sm text-emerald-600">Saved!</span>}
          </div>
        </form>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Delete account</h2>
        <p className="text-sm text-zinc-500">
          Permanently deletes your login, followed artists, and location. This can&apos;t be undone.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
