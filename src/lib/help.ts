// Content for the Help button: the quick tour and tips for the page you're on.
// Keep it in step with the real features; src/lib/help.test.ts checks the links.

export type TourIcon = "search" | "follow" | "alerts" | "shows" | "presales" | "passport" | "help";

export type TourStep = {
  id: string;
  icon: TourIcon;
  title: string;
  text: string;
  action?: { href: string; label: string };
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "find",
    icon: "search",
    title: "Find an artist",
    text: "Search any artist on the homepage. You don't need the full name: typing \"calv\" finds Calvin Harris.",
    action: { href: "/", label: "Go to search" },
  },
  {
    id: "follow",
    icon: "follow",
    title: "Follow the ones you love",
    text: "Tap Follow on an artist (signing in with Google is free). Their shows, presales, and sale times collect in My Artists.",
    action: { href: "/my-artists", label: "Open My Artists" },
  },
  {
    id: "alerts",
    icon: "alerts",
    title: "Turn on alerts",
    text: "In Settings, turn on notifications on each device. We tell you about new shows and remind you a day and an hour before a sale. On iPhone, add TourTix to your Home Screen first (Share, then Add to Home Screen).",
    action: { href: "/settings#notifications", label: "Open notification settings" },
  },
  {
    id: "shows",
    icon: "shows",
    title: "Tap a show for everything",
    text: "Each show has the sale times, a Remind me button for your calendar, a Mark as going button (saved only on your device), and a link to the seller. We don't sell tickets: you buy and pay on the seller's site.",
  },
  {
    id: "presales",
    icon: "presales",
    title: "See which presales you can get into",
    text: "Tick your accounts and cards in Settings, and shows highlight the presales you likely qualify for. Verified Fan and fan club presales always need their own sign-up.",
    action: { href: "/settings#presales", label: "Choose your presales" },
  },
  {
    id: "passport",
    icon: "passport",
    title: "Collect concert stamps",
    text: "Add concerts you've been to and collect a stamp for each. See your totals, and make a picture to share. It's private: only you can see your stamps.",
    action: { href: "/passport", label: "Open your passport" },
  },
  {
    id: "help",
    icon: "help",
    title: "Stuck? Tap the ? button",
    text: "It's on every page. It has tips for the page you're on, the FAQ, notification help, and a way to contact us.",
    action: { href: "/faq", label: "Read the FAQ" },
  },
];

export type Tip = { title: string; text: string };
export type PageKey = "home" | "artist" | "my-artists" | "passport" | "settings" | "concerts" | "this-week" | "faq" | "other";

export const PAGE_TIPS: Record<PageKey, { heading: string; tips: Tip[] }> = {
  home: {
    heading: "Searching and browsing",
    tips: [
      { title: "Type part of a name", text: "\"calv\" finds Calvin Harris and \"taylor sw\" finds Taylor Swift. Pick from the list or press Search." },
      { title: "Filter by genre", text: "The chips under the search box narrow the sections below to one kind of music." },
      { title: "Presales happening now", text: "Open right now. Most need a code, sign-up, or membership, and each card says how to get in." },
    ],
  },
  artist: {
    heading: "On an artist page",
    tips: [
      { title: "Tap Follow", text: "Follow to get alerts and see this artist in My Artists." },
      { title: "Tap a show", text: "It opens the tickets button, Remind me (adds the sale to your calendar), and presale details." },
      { title: "Same date twice?", text: "Ticketmaster lists passes and packages separately. The listing name under the venue tells them apart." },
      { title: "Been to a show?", text: "Add it to your concert passport to collect a stamp." },
    ],
  },
  "my-artists": {
    heading: "Your artists",
    tips: [
      { title: "Near me", text: "Set your location in Settings, then use the Near me switch to see only shows close to you." },
      { title: "Alerts not arriving?", text: "Check Settings, then the notification help page. On iPhone, TourTix must be on your Home Screen." },
    ],
  },
  passport: {
    heading: "Your concert passport",
    tips: [
      { title: "Add a concert", text: "Type the artist, pick the date, and add the city and venue if you like. Dates can be today or earlier." },
      { title: "It's private", text: "Only you can see your stamps. Nothing here is public." },
      { title: "Share a picture", text: "Choose what to show (dates, cities, a first name), then tap Share picture. It isn't saved or linked anywhere." },
      { title: "Made a mistake?", text: "Tap the bin on a stamp to remove it." },
    ],
  },
  settings: {
    heading: "In Settings",
    tips: [
      { title: "Location", text: "A ZIP code is enough. It's used to mark shows near you." },
      { title: "Notifications", text: "Turn them on for each device you want alerts on. Use Send test to check it works." },
      { title: "Presales I can get into", text: "Tick what you have. We only match presale names, and the seller decides who can actually buy." },
    ],
  },
  concerts: {
    heading: "Finding concerts",
    tips: [
      { title: "Search by city", text: "Enter a city (and a state if you like) to see shows over the next 30 days." },
      { title: "Near me", text: "Share your location in Settings to use the near me option." },
    ],
  },
  "this-week": {
    heading: "This week's drops",
    tips: [
      { title: "Soonest first", text: "Sales are listed in order. Times are in each venue's local time." },
      { title: "Tap an artist", text: "You'll see every sale stage, how to get in, and the seller link. Tap Follow there to get alerts." },
      { title: "Share it", text: "The Share button sends a link to this list to a friend or group chat." },
    ],
  },
  faq: {
    heading: "On this page",
    tips: [{ title: "Not here?", text: "Use the contact form and we'll help." }],
  },
  other: {
    heading: "Good to know",
    tips: [
      { title: "We don't sell tickets", text: "We show dates and sale times and link you to the seller." },
      { title: "Free and private", text: "No ads, and your data is yours. You can delete it any time in Settings." },
    ],
  },
};

export function pageKey(pathname: string): PageKey {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/artists/")) return "artist";
  if (pathname.startsWith("/my-artists")) return "my-artists";
  if (pathname.startsWith("/passport")) return "passport";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/concerts")) return "concerts";
  if (pathname.startsWith("/this-week")) return "this-week";
  if (pathname.startsWith("/faq")) return "faq";
  return "other";
}

export const tipsFor = (pathname: string) => PAGE_TIPS[pageKey(pathname)];

// Fired by buttons elsewhere (footer, FAQ, the first-visit nudge) to open Help.
export const HELP_EVENT = "tourtix:help";
export type HelpView = "menu" | "tour";
export const TOUR_SEEN_KEY = "tourtix-tour-seen";
