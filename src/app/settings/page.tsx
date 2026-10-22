import { currentUserId } from "@/auth";
import { ChevronRight, Inbox } from "lucide-react";
import type { Metadata } from "next";
import { saveAlertPrefs } from "@/app/actions";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { InstallButton } from "@/components/InstallButton";
import { LocationForm } from "@/components/LocationForm";
import { NotificationsToggle } from "@/components/NotificationsToggle";
import { SignInPrompt } from "@/components/SignInPrompt";
import { DEFAULT_RADIUS } from "@/lib/geo";
import { currentAdminId } from "@/lib/admin";
import { getVapidKeys } from "@/lib/push";
import { btnPrimary } from "@/lib/ui";
import { getProfile } from "@/lib/user-data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const userId = await currentUserId();
  if (!userId) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <SignInPrompt label="Sign in with Google" redirectTo="/settings" />
      </div>
    );
  }
  const { saved, error } = await searchParams;
  const [profile, { publicKey }, adminId] = await Promise.all([
    getProfile(userId),
    getVapidKeys(),
    currentAdminId(),
  ]);
  const radius = profile?.radiusMiles ?? DEFAULT_RADIUS;
  const locationSummary = profile?.zip
    ? `${profile.city ? `${profile.city}, ${profile.region ?? ""} ` : ""}${profile.zip} · within ${radius} miles`
    : profile?.lat != null
      ? `Your current location · within ${radius} miles`
      : profile?.region
        ? `${profile.city ? `${profile.city}, ` : ""}${profile.region}`
        : null;

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
      {adminId && (
        <a
          href="/admin/messages"
          className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4 text-sm font-medium text-accent transition hover:opacity-90"
        >
          <Inbox size={18} aria-hidden />
          <span className="flex-1">Contact messages (only you can see this)</span>
          <ChevronRight size={18} aria-hidden />
        </a>
      )}

      <section id="location" className="scroll-mt-20 space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Your location</h2>
          <p className="text-sm text-muted">
            Used to find shows near you. Enter your ZIP code or share your current location (rounded
            to about 1 km).
          </p>
        </div>
        <LocationForm
          summary={locationSummary}
          zip={profile?.zip ?? null}
          radiusMiles={profile?.radiusMiles ?? DEFAULT_RADIUS}
          hasLocation={locationSummary != null}
          saved={saved === "1"}
          error={error ?? null}
        />
      </section>

      <section id="notifications" className="scroll-mt-20 space-y-4 border-t border-line pt-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted">
            Get a pop-up alert on this device about artists you follow. Turn it on for each device
            you want alerts on.
          </p>
        </div>
        <InstallButton />
        <NotificationsToggle publicKey={publicKey} />
        <form action={saveAlertPrefs} className="space-y-3">
          <p className="text-sm font-semibold">Alert me when:</p>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="newShows" className="mt-0.5 h-5 w-5 shrink-0 accent-accent" defaultChecked={profile?.alertNewShows ?? true} />
            An artist I follow announces a new show
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="sales" className="mt-0.5 h-5 w-5 shrink-0 accent-accent" defaultChecked={profile?.alertSales ?? true} />
            A presale or general sale is coming up (a day before and about an hour before), or a
            new presale is added
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="nearOnly" className="mt-0.5 h-5 w-5 shrink-0 accent-accent" defaultChecked={profile?.alertNearOnly ?? false} />
            Only for shows near me{!profile?.region && profile?.lat == null && " (set your location above first)"}
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className={btnPrimary}>
              Save alert settings
            </button>
            {saved === "alerts" && <span className="text-sm font-medium text-live">Saved!</span>}
          </div>
        </form>
      </section>

      <section className="space-y-3 border-t border-line pt-8">
        <h2 className="text-xl font-bold tracking-tight">Delete account</h2>
        <p className="text-sm text-muted">
          Permanently deletes your followed artists, location, and notification settings, and signs you out. This can&apos;t be undone.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
