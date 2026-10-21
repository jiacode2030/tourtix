import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="October 21, 2026">
      <p>By using TourTix, you agree to these terms.</p>

      <h2>What TourTix is</h2>
      <p>
        TourTix helps you find tour dates and links to ticket sellers. We do not sell, resell, or
        hold tickets, and we are not a party to any purchase you make. Every purchase is between you
        and the seller, under the seller&apos;s terms, prices, fees, and refund policies.
      </p>

      <h2>Accuracy</h2>
      <p>
        Show information, on-sale times, availability, and prices come from third parties and can
        change at any time. We try to keep it current but cannot guarantee it is complete or
        accurate. Always confirm the final price, including fees, on the seller&apos;s site before
        you buy.
      </p>

      <h2>Links to other sites</h2>
      <p>
        TourTix links to ticket sellers and other ticket sites. We don&apos;t earn money from these
        links. &ldquo;Also search&rdquo; links simply open another site&apos;s own search page; we
        haven&apos;t checked whether that site has the show, and we&apos;re not responsible for other
        sites&apos; content, prices, or policies.
      </p>

      <h2>Removal requests</h2>
      <p>
        Event organizers and rights holders can ask us to remove content through our{" "}
        <a href="/contact?reason=removal" className="text-violet-600 hover:underline">
          contact form
        </a>
        . We handle removal requests within 24 hours.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>You must be at least 13 years old to use TourTix.</li>
        <li>Don&apos;t use bots or scripts to scrape or overload the site.</li>
        <li>Don&apos;t use TourTix for anything illegal.</li>
      </ul>

      <h2>Trademarks</h2>
      <p>
        Artist names, images, and seller names belong to their respective owners and are used only
        to identify them. TourTix is not affiliated with or endorsed by any artist or ticket seller.
      </p>

      <h2>No warranty</h2>
      <p>
        TourTix is provided &ldquo;as is.&rdquo; To the extent allowed by law, we are not liable for
        missed sales, price changes, sold-out shows, or problems with purchases made on other sites.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date above shows when they last changed.</p>
    </LegalPage>
  );
}
