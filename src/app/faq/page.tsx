import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_GROUPS, faqJsonLd } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about TourTix: how alerts work, what presales and Verified Fan are, why you might miss a notification, and how your data is used.",
};

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />
      <div className="enter space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions &amp; answers</h1>
        <p className="text-muted">
          How TourTix works, in plain language. Can&apos;t find yours?{" "}
          <Link href="/contact" className="font-medium text-accent hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>

      {FAQ_GROUPS.map((group) => (
        <section key={group.title} className="reveal space-y-1">
          <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
          <ul className="divide-y divide-line border-y border-line">
            {group.items.map((f) => (
              <li key={f.id} id={f.id} className="scroll-mt-20">
                <details className="group smooth">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold transition active:bg-surface">
                    <span>{f.q}</span>
                    <ChevronDown size={20} aria-hidden className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="reveal-panel space-y-2 pb-4 text-[15px] leading-relaxed text-muted">
                    <p>{f.a}</p>
                    {f.link && (
                      <p>
                        <Link href={f.link.href} className="font-medium text-accent hover:underline">
                          {f.link.label}
                        </Link>
                      </p>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
