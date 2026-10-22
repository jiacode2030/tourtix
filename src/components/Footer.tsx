import Link from "next/link";
import { activeSources } from "@/lib/sources";

export function Footer() {
  const sources = activeSources();
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm text-zinc-600 dark:text-zinc-400">
        {sources.length > 0 && <p>Event data provided by {sources.join(", ")}.</p>}
        <p>
          TourTix is an independent site. We don&apos;t sell tickets; purchases happen on the
          seller&apos;s website. We are not affiliated with or endorsed by any ticket seller or
          artist shown here. All trademarks belong to their owners.
        </p>
        <p>
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-violet-600">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-violet-600">
            Privacy Policy
          </Link>
          .
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/concerts" className="hover:text-violet-600">Find concerts</Link>
          <Link href="/tips" className="hover:text-violet-600">Ticket buying tips</Link>
          <Link href="/help/notifications" className="hover:text-violet-600">Notification help</Link>
          <Link href="/settings" className="hover:text-violet-600">Settings</Link>
          <Link href="/contact" className="hover:text-violet-600">Contact</Link>
          <Link href="/privacy" className="hover:text-violet-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-violet-600">Terms of Use</Link>
        </nav>
      </div>
    </footer>
  );
}
