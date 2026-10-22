import { Check } from "lucide-react";
import { presaleAccess } from "@/lib/presale-access";

const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";

// Who can get into a presale, matched by its name. "You likely qualify" only
// appears for accounts and cards the user ticked in Settings.
export function PresaleBadge({ name, memberships = [] }: { name: string; memberships?: readonly string[] }) {
  const access = presaleAccess(name, memberships);
  switch (access.kind) {
    case "yours":
      return (
        <span className={`${base} bg-live-soft text-live`}>
          <Check size={12} strokeWidth={3} aria-hidden /> You likely qualify
        </span>
      );
    case "member":
      return <span className={`${base} bg-surface-2 text-muted`}>Needs {access.label}</span>;
    case "signup":
      return <span className={`${base} bg-accent-soft text-accent`}>Needs sign-up</span>;
    case "vip":
      return <span className={`${base} bg-surface-2 text-muted`}>VIP packages · open to all</span>;
    default:
      return null;
  }
}
