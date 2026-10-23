import { currentUserId } from "@/auth";
import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { PassportForm } from "@/components/PassportForm";
import { PassportHowItWorks } from "@/components/PassportHowItWorks";
import { PassportPlans } from "@/components/PassportPlans";
import { ShareCard } from "@/components/ShareCard";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SignInNotice } from "@/components/SignInNotice";
import { StampCard } from "@/components/StampCard";
import { passportStats } from "@/lib/passport";
import { listStamps } from "@/lib/user-data";

export const metadata: Metadata = { title: "Concert passport", robots: { index: false } };

const errors: Record<string, string> = {
  name: "Add the artist's name.",
  date: "That date doesn't look right. Pick it from the calendar.",
  future: "Stamps are for concerts you've already been to. Pick today or an earlier date.",
  old: "That date is too far back. Pick a date from 1950 on.",
  full: "Your passport is full (500 stamps). Remove one to add another.",
};

export default async function PassportPage({ searchParams }: { searchParams: Promise<{ error?: string; added?: string }> }) {
  const userId = await currentUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your concert passport</h1>
        <p className="text-muted">
          Collect a stamp for every concert you go to, see your totals, and make a picture to share. It&apos;s private:
          only you can see your stamps.
        </p>
        <SignInPrompt label="Sign in with Google" redirectTo="/passport" />
        <SignInNotice />
      </div>
    );
  }

  const { error, added } = await searchParams;
  const stamps = await listStamps(userId);
  const stats = passportStats(stamps);
  const tiles: [string, number][] = [
    ["Concerts", stats.concerts],
    ["Artists", stats.artists],
    ["Cities", stats.cities],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="enter space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Concert passport</h1>
        <p className="flex items-center gap-2 text-sm text-muted">
          <Lock size={14} aria-hidden /> Only you can see this. Nothing here is public.
        </p>
      </div>

      {added && (
        <p role="status" className="pop rounded-2xl bg-live-soft px-4 py-3 text-sm font-medium text-live">
          Stamped! Added to your passport.
        </p>
      )}

      {stamps.length > 0 && (
        <section className="grid grid-cols-3 gap-3" aria-label="Your totals">
          {tiles.map(([label, n]) => (
            <div key={label} className="rounded-3xl bg-surface p-4 text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">{n}</div>
              <div className="text-sm text-muted">{label}</div>
            </div>
          ))}
          {stats.topArtist && (
            <p className="col-span-3 text-center text-sm text-muted">
              Most seen: <span className="font-semibold text-fg">{stats.topArtist.name}</span> ({stats.topArtist.count} times)
            </p>
          )}
        </section>
      )}

      <PassportPlans />

      <PassportForm error={error ? (errors[error] ?? null) : null} />

      {stamps.length > 0 ? (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight">Your stamps</h2>
            <ul className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stamps.map((s) => (
                <StampCard key={s.id} stamp={s} />
              ))}
            </ul>
          </section>
          <ShareCard />
        </>
      ) : (
        <PassportHowItWorks />
      )}
    </div>
  );
}
