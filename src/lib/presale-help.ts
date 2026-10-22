// General guidance on how common presale types work, matched by name.
// Deliberately generic and never includes codes: rules differ per tour, so
// the UI always points people to the seller's own presale details.

const RULES: { match: RegExp; help: string }[] = [
  {
    match: /verified fan/i,
    help: "Register on Ticketmaster's Verified Fan page before registration closes. Selected fans get access or a code before the sale.",
  },
  {
    match: /spotify/i,
    help: "Run by Spotify. Eligible fans (often an artist's top listeners) are invited through the Spotify app or email.",
  },
  {
    match: /live ?nation/i,
    help: "Usually for Live Nation members. Make a free account at livenation.com and sign in to Ticketmaster before it starts; some tours require a Live Nation membership.",
  },
  {
    match: /citi|amex|american express|capital one|chase|visa|mastercard|telstra|card ?member/i,
    help: "For holders of that card or program. Have the card ready at checkout or check the program's site for access.",
  },
  {
    match: /vip/i,
    help: "Ticket packages with extras like merch or early entry, usually priced higher than regular tickets.",
  },
  {
    match: /venue|arena|stadium|theat(er|re)|amphitheat/i,
    help: "Often for people on the venue's email list or app. Sign up with the venue ahead of time to get the code.",
  },
  {
    match: /artist|fan ?club|official/i,
    help: "Usually requires signing up on the artist's official website or fan club before the presale. Access or a code is typically emailed.",
  },
  {
    match: /radio|station/i,
    help: "Codes are usually announced by the radio station on air or on its website or social media.",
  },
];

export function presaleHelp(name: string): string {
  return RULES.find((r) => r.match.test(name))?.help ?? "Check the seller's presale details for who can join and how to get access.";
}
