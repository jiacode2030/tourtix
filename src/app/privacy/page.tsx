import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { activeSources } from "@/lib/sources";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 22, 2026">
      <p>
        This policy explains what information TourTix collects and how it is used. We will update
        this page whenever that changes, and the date above will change with it.
      </p>

      <h2>What we collect</h2>
      <p>You can search artists and view shows without an account. If you create an account, we collect:</p>
      <ul>
        <li>
          <strong>Account details:</strong> you sign in with Google, which shares your Google
          account ID, name, email address, and profile picture with us. We keep these in a secure
          sign-in cookie on your device; our database stores only your Google account ID, linked
          to the data below.
        </li>
        <li>
          <strong>Artists you follow</strong>, so we can show you their upcoming shows.
        </li>
        <li>
          <strong>Your location</strong>: either the ZIP code you enter (with its city, state, and
          approximate map position), or, only if you click &ldquo;Use my current location&rdquo;,
          your coordinates rounded to about 1 km, plus the distance you choose. Used to find shows
          near you. You can remove it any time. To look up a ZIP code we send only the ZIP itself
          to Zippopotam.us, a free public ZIP code service.
        </li>
        <li>
          <strong>Presale programs you tick</strong> (for example &ldquo;American Express
          card&rdquo; or &ldquo;Live Nation account&rdquo;), only if you choose to, so we can
          highlight presales you likely qualify for. We never ask for card numbers, account
          logins, or presale codes, and we don&apos;t check with those programs.
        </li>
        <li>
          <strong>Concert passport stamps</strong>, if you add any: the artist, the date, and the
          city and venue if you choose to enter them. They are private: only you can see your
          stamps, and we don&apos;t show them to anyone else or use them for anything else. If you
          make a picture of your passport to share, it is created when you ask, includes only what
          you tick (dates, cities, a first name), and isn&apos;t saved by us or given a public link.
          What you do with the picture afterwards is up to you.
        </li>
        <li>
          <strong>Notification settings</strong>, if you turn on notifications: which alerts you
          want, a record of alerts already sent, and the push address your browser gives us for
          delivering them. Turning notifications off on a device deletes that device&apos;s push
          address.
        </li>
      </ul>
      <p>
        When you search, your search term is sent to our ticket data providers (currently
        {activeSources().join(" and ") || "Ticketmaster"}) to look up artists and shows. Artist photos and seat maps load
        directly from Ticketmaster&apos;s servers, which can see your IP address when they do. Our hosting provider, Vercel, keeps
        standard server logs such as IP address, browser type, and pages requested, for security and
        reliability.
      </p>

      <h2>Visitor statistics</h2>
      <p>
        We use Vercel Web Analytics to count visits and see which pages are popular. It doesn&apos;t
        use cookies, doesn&apos;t track you across sites, and doesn&apos;t identify you personally;
        it records things like the page visited, referring site, country, and device type.
      </p>

      <h2>How we use it</h2>
      <p>
        Only to run TourTix: signing you in, showing your artists and nearby shows, and keeping the
        site secure. We do not sell or rent personal information, and we do not use it for
        advertising.
      </p>

      <h2>Cookies</h2>
      <p>
        TourTix itself uses cookies only to keep you signed in and to keep sign-in secure. We do
        not use advertising cookies or tracking pixels, and we don&apos;t show ads.
      </p>
      <p>
        If you pick light or dark mode, or dismiss or finish the welcome tour, your choice is saved
        in your browser&apos;s local storage on your device so we can remember it. It never leaves
        your device.
      </p>
      <p>
        If you tap &ldquo;Mark as going&rdquo; on a show, the show (artist, date, city, and venue) is
        saved the same way, only in your browser&apos;s local storage on your device. We don&apos;t
        receive it, store it on our servers, or see it. It works without an account. Tap the button
        again, remove it from your passport page, or clear your browser&apos;s site data to delete
        it. If you later tap &ldquo;Yes, stamp it&rdquo;, the concert is added to your passport as
        described above.
      </p>
      <p>
        Third parties may place or read their own cookies and collect information directly from
        you: Google when you sign in (and when your Google profile picture loads), Ticketmaster when its artist photos and seat maps load, and
        any ticket site you click through to. Their own privacy policies apply to that.
      </p>

      <h2>Who we share it with</h2>
      <p>We use these service providers, which process data on our behalf:</p>
      <ul>
        <li><strong>Google</strong>: sign-in</li>
        <li><strong>Neon</strong>: database storing followed artists, location, presale programs, passport stamps, notification settings, and contact messages</li>
        <li><strong>Vercel</strong>: website hosting and visitor statistics</li>
        <li>
          <strong>Your browser&apos;s push service</strong> (for example Google, Apple, Mozilla, or Microsoft):
          delivers notifications to your device
        </li>
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
        from <strong>Settings → Delete my account</strong>, which permanently removes your
        followed artists, location, presale programs, passport stamps, notification settings, and any contact messages you sent while
        signed in.
      </p>

      <h2>Contact messages</h2>
      <p>
        If you use our contact form, we store your message, the topic, and the email address you
        choose to give (optional) so we can respond. We delete messages once they&apos;re handled.
      </p>

      <h2>Children</h2>
      <p>TourTix is not intended for children under 13, and we do not knowingly collect information from them.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example California or the EU), you may have rights to
        access, correct, or delete your personal information. You can view and change your
        followed artists and location on the site, and delete everything from Settings.
        {" "}For any other request, use our{" "}
        <a href="/contact?reason=privacy" className="font-medium text-accent hover:underline">
          contact form
        </a>
        .
      </p>

      <h2>Changes</h2>
      <p>We will update this page when what we collect changes, and the date above will change with it.</p>
    </LegalPage>
  );
}
