// "Which presales can I get into?" Users tick the accounts and cards they
// have; presales are matched to those by name. Matching is by public presale
// names only: no codes, and nothing is checked with the programs themselves.

import { realPresales } from "./sales";
import type { Presale, Show } from "./types";

export const MEMBERSHIPS = [
  { key: "livenation", label: "Live Nation account", hint: "Free at livenation.com", match: /live ?nation/i },
  { key: "ticketmaster", label: "Ticketmaster account", hint: "Free", match: /ticketmaster/i },
  { key: "amex", label: "American Express card", match: /amex|american express/i },
  { key: "citi", label: "Citi card", match: /\bciti/i },
  { key: "capitalone", label: "Capital One card", match: /capital ?one/i },
  { key: "chase", label: "Chase card", match: /chase/i },
  { key: "verizon", label: "Verizon customer", match: /verizon/i },
  { key: "siriusxm", label: "SiriusXM subscriber", match: /sirius/i },
  { key: "spotify", label: "Spotify presale invites", hint: "Spotify invites an artist's top listeners", match: /spotify/i },
] as const;

export type MembershipKey = (typeof MEMBERSHIPS)[number]["key"];

const KEYS = new Set<string>(MEMBERSHIPS.map((m) => m.key));

export function cleanMemberships(values: unknown[]): MembershipKey[] {
  return [...new Set(values.filter((v): v is MembershipKey => typeof v === "string" && KEYS.has(v)))];
}

export type PresaleAccess =
  // The user ticked the matching account or card.
  | { kind: "yours"; label: string }
  // Tied to an account or card the user hasn't ticked.
  | { kind: "member"; key: MembershipKey; label: string }
  // Needs signing up for this tour (Verified Fan, fan club, venue list...).
  // Never shown as "you can get in": sign-up is per tour and often a lottery.
  | { kind: "signup" }
  // VIP ticket packages anyone can buy, usually at a higher price.
  | { kind: "vip" }
  | { kind: "unknown" };

const SIGNUP =
  /verified fan|artist|fan ?club|official|member|legacy|insider|pre-?order|venue|arena|stadium|theat(er|re)|amphitheat|center|centre|dome|garden|pavilion|hall\b|radio|station|newsletter|local/i;

export function presaleAccess(name: string, mine: readonly string[] = []): PresaleAccess {
  // Checked first: "Ticketmaster Verified Fan" needs registration, not just an account.
  if (/verified fan/i.test(name)) return { kind: "signup" };
  const program = MEMBERSHIPS.find((m) => m.match.test(name));
  if (program) {
    return mine.includes(program.key)
      ? { kind: "yours", label: program.label }
      : { kind: "member", key: program.key, label: program.label };
  }
  // Before VIP: "Fan Club VIP Packages Presale" still needs the fan club.
  if (SIGNUP.test(name)) return { kind: "signup" };
  if (/vip/i.test(name)) return { kind: "vip" };
  return { kind: "unknown" };
}

// Earliest presale on this show the user can get into that hasn't ended.
export function earliestForYou(
  show: Show,
  mine: readonly string[],
  now = Date.now(),
): (Presale & { start: string }) | null {
  if (!mine.length) return null;
  return (
    realPresales(show)
      .filter((p): p is Presale & { start: string } => !!p.start && (!p.end || Date.parse(p.end) > now))
      .filter((p) => presaleAccess(p.name, mine).kind === "yours")
      .sort((a, b) => a.start.localeCompare(b.start))[0] ?? null
  );
}
