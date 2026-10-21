import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Notification help · TourTix" };

const sections: { id: string; title: string; steps: React.ReactNode[] }[] = [
  {
    id: "mac",
    title: "Mac",
    steps: [
      <>Open the Apple menu → <strong>System Settings</strong> → <strong>Notifications</strong>.</>,
      <>
        Find your browser in the list (for example <strong>Google Chrome</strong>, and also{" "}
        <strong>Google Chrome Helper (Alerts)</strong> if it&apos;s there). Turn on{" "}
        <strong>Allow notifications</strong> and set the style to <strong>Banners</strong> or{" "}
        <strong>Alerts</strong>.
      </>,
      <>
        If your browser isn&apos;t listed, quit it completely (<strong>Cmd + Q</strong>), reopen it,
        and turn TourTix notifications on again.
      </>,
      <>Make sure <strong>Focus / Do Not Disturb</strong> is off in Control Center.</>,
    ],
  },
  {
    id: "windows",
    title: "Windows",
    steps: [
      <>Open <strong>Settings</strong> → <strong>System</strong> → <strong>Notifications</strong>.</>,
      <>Turn notifications on, and make sure your browser (Chrome, Edge, Firefox) is allowed.</>,
      <>Turn off <strong>Do not disturb</strong> / <strong>Focus</strong>.</>,
    ],
  },
  {
    id: "iphone",
    title: "iPhone and iPad",
    steps: [
      <>Open TourTix in <strong>Safari</strong>, tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong>.</>,
      <>Open TourTix from the new Home Screen icon (not from Safari) and turn notifications on in Settings.</>,
      <>
        If you still see nothing: iPhone <strong>Settings</strong> → <strong>Notifications</strong> →{" "}
        <strong>TourTix</strong> → turn on <strong>Allow Notifications</strong>.
      </>,
      <>Make sure a <strong>Focus</strong> mode isn&apos;t silencing notifications.</>,
    ],
  },
  {
    id: "android",
    title: "Android",
    steps: [
      <>
        Open phone <strong>Settings</strong> → <strong>Apps</strong> → your browser (e.g. Chrome) →{" "}
        <strong>Notifications</strong>, and turn them on.
      </>,
      <>Turn off <strong>Do Not Disturb</strong>.</>,
    ],
  },
  {
    id: "chrome",
    title: "Chrome, Edge, or Arc (any computer)",
    steps: [
      <>
        Click the icon to the left of the web address → <strong>Site settings</strong> → set{" "}
        <strong>Notifications</strong> to <strong>Allow</strong>.
      </>,
      <>Reload the page, then turn notifications off and on again in TourTix Settings.</>,
    ],
  },
  {
    id: "brave",
    title: "Brave",
    steps: [
      <>
        Brave blocks website notifications by default. Open <strong>Settings</strong> →{" "}
        <strong>Privacy and security</strong> → turn on{" "}
        <strong>Use Google services for push messaging</strong>, then restart Brave.
      </>,
    ],
  },
  {
    id: "firefox-safari",
    title: "Firefox or Safari on a computer",
    steps: [
      <>
        <strong>Firefox:</strong> click the icon to the left of the web address and make sure
        notifications aren&apos;t blocked for this site.
      </>,
      <>
        <strong>Safari:</strong> Safari menu → <strong>Settings</strong> → <strong>Websites</strong>{" "}
        → <strong>Notifications</strong> → set TourTix to <strong>Allow</strong>.
      </>,
    ],
  },
];

export default function NotificationHelpPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Not seeing notifications?</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          If TourTix says &ldquo;Test sent&rdquo; but nothing pops up, your device or browser is
          hiding it. Find your device below. After changing a setting, go to{" "}
          <Link href="/settings" className="text-violet-600 hover:underline">
            Settings
          </Link>
          , turn notifications off and on again, and send another test.
        </p>
        <p className="text-sm text-zinc-500">
          Also check your notification center: the alert may already be there.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-zinc-300 px-3 py-1 hover:border-violet-500 hover:text-violet-600 dark:border-zinc-700"
          >
            {s.title}
          </a>
        ))}
      </nav>

      {sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-6 space-y-3">
          <h2 className="text-xl font-semibold">{s.title}</h2>
          <ol className="list-decimal space-y-2 pl-6 leading-relaxed">
            {s.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  );
}
