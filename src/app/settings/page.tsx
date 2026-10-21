import { currentUserId } from "@/auth";
import type { Metadata } from "next";
import { saveAlertPrefs, saveLocation } from "@/app/actions";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { InstallButton } from "@/components/InstallButton";
import { LocationFields } from "@/components/LocationFields";
import { NotificationsToggle } from "@/components/NotificationsToggle";
import { SignInPrompt } from "@/components/SignInPrompt";
import { DEFAULT_RADIUS, RADIUS_OPTIONS } from "@/lib/geo";
import { currentAdminId } from "@/lib/admin";
import { getVapidKeys } from "@/lib/push";
import { usStates } from "@/lib/regions";
import { getProfile } from "@/lib/user-data";

export const metadata: Metadata = { title: "Settings" };

const field =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const userId = await currentUserId();
  if (!userId) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <SignInPrompt label="Sign in with Google" redirectTo="/settings" />
      </div>
    );
  }
  const saved = (await searchParams).saved;
  const [profile, { publicKey }, adminId] = await Promise.all([
    getProfile(userId),
    getVapidKeys(),
    currentAdminId(),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>
      {adminId && (
        <a
          href="/admin/messages"
          className="block rounded-xl border border-violet-300 bg-violet-50 p-4 text-sm font-medium text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200"
        >
          📬 Contact messages (only you can see this) →
        </a>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Your location</h2>
          <p className="text-sm text-zinc-500">
            Used to find shows near you. We store only what you save here, and precise locations
            are rounded to about 1 km.
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
          <LocationFields lat={profile?.lat ?? null} lng={profile?.lng ?? null} />
          <label className="block space-y-1">
            <span className="text-sm font-medium">&ldquo;Near me&rdquo; means within</span>
            <select name="radius" defaultValue={profile?.radiusMiles ?? DEFAULT_RADIUS} className={field}>
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} miles
                </option>
              ))}
            </select>
            <span className="block text-xs text-zinc-500">
              Distance is used when you share your location; otherwise &ldquo;near&rdquo; means
              your state.
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Save
            </button>
            {saved === "1" && <span className="text-sm text-emerald-600">Saved!</span>}
          </div>
        </form>
      </section>

      <section className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-zinc-500">
            Get a pop-up alert on this device about artists you follow. Turn it on for each device
            you want alerts on.
          </p>
        </div>
        <InstallButton />
        <NotificationsToggle publicKey={publicKey} />
        <form action={saveAlertPrefs} className="space-y-3">
          <p className="text-sm font-medium">Alert me when:</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="newShows" defaultChecked={profile?.alertNewShows ?? true} />
            An artist I follow announces a new show
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="sales" defaultChecked={profile?.alertSales ?? true} />
            A presale or general sale starts within 24 hours
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="nearOnly" defaultChecked={profile?.alertNearOnly ?? false} />
            Only for shows near me{!profile?.region && profile?.lat == null && " (set your location above first)"}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Save alert settings
            </button>
            {saved === "alerts" && <span className="text-sm text-emerald-600">Saved!</span>}
          </div>
        </form>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Delete account</h2>
        <p className="text-sm text-zinc-500">
          Permanently deletes your followed artists, location, and notification settings, and signs you out. This can&apos;t be undone.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
