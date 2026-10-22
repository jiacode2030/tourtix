// FAQ content. Each answer is checked against what the site really does, so
// update this file whenever a feature changes. The page and the search-engine
// markup are both built from it.

export type Faq = {
  id: string;
  q: string;
  a: string;
  link?: { href: string; label: string };
};

export type FaqGroup = { title: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "The basics",
    items: [
      {
        id: "what-is-tourtix",
        q: "What is TourTix?",
        a: "A free site that shows tour dates, presales, and on-sale times for the artists you follow, sends you alerts, and links you to the ticket seller. We don't sell tickets, and we're an independent fan project, not affiliated with any artist or ticket seller.",
      },
      {
        id: "cost",
        q: "Does it cost anything?",
        a: "No. TourTix is free, has no ads, and we don't earn money from the links to ticket sellers.",
      },
      {
        id: "account",
        q: "Do I need an account?",
        a: "Not to browse. You can search artists and see their shows without signing in. Sign in with Google to follow artists, get alerts, save your location, and see which presales you may qualify for. You must be at least 13.",
      },
      {
        id: "data-source",
        q: "Where does the information come from?",
        a: "From Ticketmaster's public event data. It can change at any time, so always confirm the date, time, and final price (including fees) on the seller's site before you buy.",
      },
      {
        id: "freshness",
        q: "How up to date is it?",
        a: "Pages refresh from the source about every 5 minutes, and each page shows when it was last checked. Notifications are checked about once an hour, so an alert can arrive a little late.",
      },
    ],
  },
  {
    title: "Alerts and reminders",
    items: [
      {
        id: "get-alerts",
        q: "How do I get alerts?",
        a: "Sign in, follow an artist, then turn on notifications in Settings. You'll hear about new shows, new presales, and upcoming sales (a day before and about an hour before). Turn notifications on for each device you want alerts on.",
        link: { href: "/settings#notifications", label: "Open notification settings" },
      },
      {
        id: "no-alert",
        q: "Why didn't I get an alert?",
        a: "The usual causes are notifications being blocked in your browser or phone settings, Do Not Disturb or Focus being on, or (on iPhone) TourTix not being added to the Home Screen. Alerts are also only checked about once an hour. The help page walks through each device.",
        link: { href: "/help/notifications", label: "Notification help" },
      },
      {
        id: "iphone",
        q: "How do I get alerts on iPhone?",
        a: "iPhone only allows website alerts for sites added to the Home Screen. In Safari, tap Share, then \"Add to Home Screen\", open TourTix from that icon, and turn on notifications in Settings.",
      },
      {
        id: "calendar",
        q: "Can I get a reminder in my calendar instead?",
        a: "Yes. Tap \"Remind me\" on any sale to add it to Google Calendar or Apple/Outlook. Your calendar app will alert you even if phone notifications are off.",
      },
    ],
  },
  {
    title: "Presales and tickets",
    items: [
      {
        id: "presale",
        q: "What is a presale?",
        a: "A sale that opens before the general sale, usually for a particular group: fan club members, cardholders, a venue's email list, or people who registered in advance. Each presale on TourTix has a short note on how it usually works.",
      },
      {
        id: "verified-fan",
        q: "What is Verified Fan, and what's the deadline to register?",
        a: "Verified Fan is Ticketmaster's registration system for high-demand sales. You register ahead of time and some registrants are selected to buy. Registration deadlines are set for each tour and sometimes extended, and they aren't in the data we receive, so TourTix can't show them. Use the sign-up link on the presale and check its deadline.",
      },
      {
        id: "likely-qualify",
        q: "What does \"You likely qualify\" mean?",
        a: "It's our best guess. If you tick an account or card in Settings (like Amex or a Live Nation account), we highlight presales with that name. The seller decides who can actually buy, and we never check with any program. Artist, fan club, venue, and Verified Fan presales are always marked \"needs sign-up\" because they require a separate sign-up for each tour.",
        link: { href: "/settings#presales", label: "Choose your presales" },
      },
      {
        id: "codes",
        q: "Do you share or ask for presale codes?",
        a: "No. We never share presale codes, and we never ask for codes, card numbers, or account logins.",
      },
      {
        id: "buy",
        q: "Can I buy tickets on TourTix?",
        a: "No. Tap a show, then \"Get tickets\" to go to the seller's site, where you buy and pay. Prices, fees, and refunds are set by the seller.",
      },
      {
        id: "other-site-button",
        q: "Why does a button name a different site than Ticketmaster?",
        a: "Some listings, such as VIP or travel packages, are sold through a partner site that Ticketmaster links to. The button names the site it really goes to, so you always know where you're headed.",
      },
      {
        id: "same-day-twice",
        q: "Why does a show appear more than once on the same date?",
        a: "Ticketmaster can list several things for one night: regular tickets, a multi-day pass, or a travel or VIP package. When that happens we show each listing's name under the venue so you can tell them apart.",
      },
      {
        id: "scams",
        q: "How do I avoid ticket scams?",
        a: "Buy from the official seller or a marketplace with a buyer guarantee, pay with a card, and never pay a stranger by gift card or wire transfer. Our tips page has more.",
        link: { href: "/tips", label: "Ticket buying tips" },
      },
    ],
  },
  {
    title: "Your data",
    items: [
      {
        id: "passport",
        q: "What is the concert passport?",
        a: "A private collection of concerts you've been to. Add a concert and you get a stamp; the page shows your totals and can make a picture of your passport to share. Only you can see your stamps. The picture is made when you ask for it and shows only what you tick (dates, cities, a first name). It isn't saved, and there are no public profiles.",
        link: { href: "/passport", label: "Open your passport" },
      },
      {
        id: "near-you",
        q: "How does \"near you\" work?",
        a: "If you enter a ZIP code or share your location in Settings, we mark shows within the distance you choose. Shared coordinates are rounded to about 1 km, and you can remove your location at any time.",
      },
      {
        id: "delete",
        q: "How do I delete my data?",
        a: "Go to Settings and choose Delete my account. It permanently removes your followed artists, location, presale choices, passport stamps, and notification settings.",
        link: { href: "/privacy", label: "Privacy Policy" },
      },
      {
        id: "removal",
        q: "I'm an event organizer or rights holder. How do I request removal?",
        a: "Use the contact form and choose the removal topic. We handle removal requests within 24 hours.",
        link: { href: "/contact?reason=removal", label: "Send a removal request" },
      },
    ],
  },
];

export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.items);

// Search-engine markup (schema.org FAQPage). "<" is escaped so the text can
// never end the surrounding script tag.
export function faqJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ALL_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }).replace(/</g, "\\u003c");
}
