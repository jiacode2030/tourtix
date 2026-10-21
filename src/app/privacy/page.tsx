import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy · TourTix" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 21, 2026">
      <p>
        This policy explains what information TourTix collects and how it is used. We will update
        this page whenever that changes, and the date above will change with it.
      </p>

      <h2>What we collect</h2>
      <p>You can search artists and view shows without an account. If you create an account, we collect:</p>
      <ul>
        <li>
          <strong>Account details:</strong> your email address and name, and your Google profile
          basics if you sign in with Google. These are handled by our login provider, Clerk.
        </li>
        <li>
          <strong>Artists you follow</strong>, so we can show you their upcoming shows.
        </li>
        <li>
          <strong>Your location</strong>, only the city and state you enter in Settings, so we can
          highlight shows near you.
        </li>
      </ul>
      <p>
        When you search, your search term is sent to our ticket data providers (currently
        Ticketmaster and SeatGeek) to look up artists and shows. Our hosting provider, Vercel, keeps
        standard server logs such as IP address, browser type, and pages requested, for security and
        reliability.
      </p>

      <h2>How we use it</h2>
      <p>
        Only to run TourTix: signing you in, showing your artists and nearby shows, and keeping the
        site secure. We do not sell or rent personal information, and we do not use it for
        advertising.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies only to keep you signed in. We do not use advertising cookies or tracking
        pixels.
      </p>

      <h2>Who we share it with</h2>
      <p>We use these service providers, which process data on our behalf:</p>
      <ul>
        <li><strong>Clerk</strong>: sign-in and account management</li>
        <li><strong>Neon</strong>: database storing followed artists and location</li>
        <li><strong>Vercel</strong>: website hosting</li>
      </ul>
      <p>These providers are based in the United States, so your data is stored there.</p>

      <h2>Links to ticket sellers</h2>
      <p>
        When you click a link to buy tickets, you leave TourTix and go to the seller&apos;s website.
        That seller&apos;s own privacy policy applies to anything you do there.
      </p>

      <h2>Keeping and deleting your data</h2>
      <p>
        We keep your account data until you delete your account. You can delete it at any time
        from <strong>Settings → Delete my account</strong>, which permanently removes your login,
        followed artists, and location.
      </p>

      <h2>Children</h2>
      <p>TourTix is not intended for children under 13, and we do not knowingly collect information from them.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example California or the EU), you may have rights to
        access, correct, or delete your personal information. You can view and change your
        followed artists and location on the site, and delete everything from Settings.
        {contactEmail && (
          <>
            {" "}For any other request, email{" "}
            <a href={`mailto:${contactEmail}`} className="text-violet-600 hover:underline">
              {contactEmail}
            </a>
            .
          </>
        )}
      </p>

      <h2>Changes</h2>
      <p>We will update this page when what we collect changes, and the date above will change with it.</p>
    </LegalPage>
  );
}
