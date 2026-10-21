import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy · TourTix" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 21, 2026">
      <p>
        This policy explains what information TourTix collects and how it is used. We will update
        this page whenever that changes, and the date above will change with it.
      </p>

      <h2>What we collect today</h2>
      <p>
        TourTix does not currently offer accounts and does not ask for any personal information.
        When you search, your search term is sent to our ticket data providers (currently
        Ticketmaster) to look up artists and shows. Our hosting provider, Vercel, may keep standard
        server logs such as IP address, browser type, and pages requested, for security and
        reliability.
      </p>
      <p>We do not use advertising cookies or tracking pixels, and we do not sell personal information.</p>

      <h2>Links to ticket sellers</h2>
      <p>
        When you click a link to buy tickets, you leave TourTix and go to the seller&apos;s website.
        That seller&apos;s own privacy policy applies to anything you do there. Some links may be
        affiliate links, which let the seller know the visit came from TourTix.
      </p>

      <h2>Future features</h2>
      <p>
        When we add accounts, favorite artists, and alerts, we will collect the information needed
        for those features (such as your email address, favorite artists, location preferences, and
        alert settings). This policy will be updated before those features launch to describe that
        collection, how long we keep it, and how to delete it.
      </p>

      <h2>Children</h2>
      <p>TourTix is not intended for children under 13, and we do not knowingly collect information from them.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example California or the EU), you may have rights to
        access, correct, or delete your personal information. Since we do not currently store
        personal information, there is nothing to request yet; this section will explain how to make
        a request once accounts launch.
      </p>
    </LegalPage>
  );
}
