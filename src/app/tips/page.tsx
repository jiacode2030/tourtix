import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ticket buying tips" };

const tips: { title: string; body: React.ReactNode }[] = [
  {
    title: "Buy from well-known sellers",
    body: (
      <>
        Stick to the official seller (like Ticketmaster) or established resale marketplaces that
        offer a buyer guarantee. Be very careful buying from strangers on social media, forums, or
        classified sites. Ticket scams there are common.
      </>
    ),
  },
  {
    title: "Pay in a way that protects you",
    body: (
      <>
        Use a credit card or a checkout with buyer protection. Never pay a stranger by gift card,
        wire transfer, crypto, or instant payment apps like Zelle or Venmo &ldquo;friends and
        family&rdquo;. Those payments usually can&apos;t be reversed if the tickets turn out to be fake.
      </>
    ),
  },
  {
    title: "Screenshots aren't tickets",
    body: (
      <>
        Most concert tickets are mobile tickets with rotating barcodes inside the seller&apos;s app.
        A screenshot or PDF from a stranger often won&apos;t scan. If you buy from someone, have them
        transfer the tickets through the official app so they land in your account.
      </>
    ),
  },
  {
    title: "Compare the total price, not the sticker price",
    body: (
      <>
        Fees can add a lot. Look at the final total, including fees, before you buy, and compare it
        across sellers. TourTix shows fee-included prices when sellers provide them.
      </>
    ),
  },
  {
    title: "Register for presales early",
    body: (
      <>
        Presales like Ticketmaster Verified Fan often require signing up days before the sale. Open
        a show&apos;s &ldquo;Presales, seat map &amp; info&rdquo; section on TourTix to find sign-up
        links, and add the sale time to your calendar.
      </>
    ),
  },
  {
    title: "Be ready before the sale starts",
    body: (
      <>
        Log in to the seller ahead of time, make sure your payment details are saved, and join the
        queue a few minutes early. Use one device or tab per account; opening many tabs can get you
        flagged or put at the back of the line.
      </>
    ),
  },
  {
    title: "Watch out for fake websites",
    body: (
      <>
        Check the web address before entering payment details. Scam sites copy real sellers&apos;
        designs and buy ads in search results. When in doubt, type the seller&apos;s address yourself
        or use the links on TourTix.
      </>
    ),
  },
  {
    title: "Know the refund policy",
    body: (
      <>
        Refund rules differ by seller and event. Check what happens if a show is cancelled or
        rescheduled before you buy, especially for resale tickets.
      </>
    ),
  },
];

export default function TipsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ticket buying tips</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          How to get tickets without overpaying or getting scammed. General advice, not legal or
          financial advice.
        </p>
      </div>
      <ol className="space-y-6">
        {tips.map((t, i) => (
          <li key={t.title} className="space-y-1">
            <h2 className="text-lg font-semibold">
              {i + 1}. {t.title}
            </h2>
            <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{t.body}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-zinc-500">
        Think you were scammed? Contact your bank or card issuer right away, and report it to the{" "}
        <a
          href="https://reportfraud.ftc.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:underline"
        >
          FTC
        </a>
        . <Link href="/" className="text-violet-600 hover:underline">Back to TourTix</Link>
      </p>
    </article>
  );
}
